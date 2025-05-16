module flowfi::flowfi {
    use std::error;
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use flowfi::stream::{Self};

    // Error codes
    const ESTREAM_NOT_FOUND: u64 = 1;
    const ESTREAM_ALREADY_EXISTS: u64 = 2;
    const EINVALID_DURATION: u64 = 3;
    const EINVALID_RATE: u64 = 4;
    const EINSUFFICIENT_BALANCE: u64 = 5;
    const ESTREAM_FINISHED: u64 = 6;
    const EUNAUTHORIZED: u64 = 7;
    const ESTREAM_ACTIVE: u8 = 8;

    // Stream status enum
    const STREAM_STATUS_ACTIVE: u8 = 1;
    const STREAM_STATUS_PAUSED: u8 = 2;
    const STREAM_STATUS_CANCELLED: u8 = 3;
    const STREAM_STATUS_COMPLETED: u8 = 4;

    // FlowFi protocol resource
    struct FlowFiProtocol has key {
        stream_counter: u64,
        create_stream_events: EventHandle<CreateStreamEvent>,
        withdraw_events: EventHandle<WithdrawEvent>,
        cancel_stream_events: EventHandle<CancelStreamEvent>,
    }

    // Events
    struct CreateStreamEvent has drop, store {
        stream_id: u64,
        sender: address,
        recipient: address,
        deposit_amount: u64,
        start_time: u64,
        end_time: u64,
        token_type: vector<u8>,
    }

    struct WithdrawEvent has drop, store {
        stream_id: u64,
        recipient: address,
        amount: u64,
        timestamp: u64,
    }

    struct CancelStreamEvent has drop, store {
        stream_id: u64,
        sender: address,
        recipient: address,
        sender_amount: u64,
        recipient_amount: u64,
        timestamp: u64,
    }

    // Initialize FlowFi protocol
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        // Initialize stream module
        stream::initialize(account);
        
        // Initialize FlowFi protocol
        if (!exists<FlowFiProtocol>(account_addr)) {
            move_to(account, FlowFiProtocol {
                stream_counter: 0,
                create_stream_events: account::new_event_handle<CreateStreamEvent>(account),
                withdraw_events: account::new_event_handle<WithdrawEvent>(account),
                cancel_stream_events: account::new_event_handle<CancelStreamEvent>(account),
            });
        }
    }

    // Create a new stream
    public entry fun create_stream<CoinType>(
        sender: &signer,
        recipient: address,
        deposit_amount: u64,
        start_time: u64,
        end_time: u64
    ) acquires FlowFiProtocol {
        let sender_addr = signer::address_of(sender);
        
        // Validate input parameters
        let current_time = timestamp::now_seconds();
        assert!(start_time >= current_time, error::invalid_argument(EINVALID_RATE));
        assert!(end_time > start_time, error::invalid_argument(EINVALID_DURATION));
        assert!(deposit_amount > 0, error::invalid_argument(EINVALID_RATE));
        
        // Calculate duration and rate
        let duration = end_time - start_time;
        let rate_per_second = deposit_amount / duration;
        
        // Get FlowFi protocol
        let flowfi = borrow_global_mut<FlowFiProtocol>(@flowfi);
        
        // Create new stream ID
        let stream_id = flowfi.stream_counter + 1;
        flowfi.stream_counter = stream_id;
        
        // Register stream in the stream module
        stream::create_stream(
            sender_addr,
            recipient,
            stream_id,
            deposit_amount,
            start_time,
            end_time,
            duration,
            rate_per_second,
            STREAM_STATUS_ACTIVE
        );
        
        // Withdraw funds from sender
        let coins = coin::withdraw<CoinType>(sender, deposit_amount);
        
        // Create escrow or deposit to shared treasury
        // For demo, we'll just deposit to recipient
        coin::deposit(recipient, coins);
        
        // Create token name vector
        let token_type = b"AptosToken";
        
        // Emit create stream event
        event::emit_event(
            &mut flowfi.create_stream_events,
            CreateStreamEvent {
                stream_id,
                sender: sender_addr,
                recipient,
                deposit_amount,
                start_time,
                end_time,
                token_type
            },
        );
    }

    // Withdraw from stream
    public entry fun withdraw<CoinType>(
        recipient: &signer,
        sender: address,
        stream_id: u64
    ) acquires FlowFiProtocol {
        let recipient_addr = signer::address_of(recipient);
        
        // Get stream info
        assert!(stream::stream_exists(sender, stream_id), error::not_found(ESTREAM_NOT_FOUND));
        let (stream_sender, stream_recipient, _, _, _, total_amount, withdrawn_amount, status) = 
            stream::get_stream_info(sender, stream_id);
        
        // Validate recipient and stream status
        assert!(stream_recipient == recipient_addr, error::permission_denied(EUNAUTHORIZED));
        assert!(status == STREAM_STATUS_ACTIVE, error::invalid_state(ESTREAM_FINISHED));
        
        // Calculate available amount
        let current_time = timestamp::now_seconds();
        let available_amount = stream::get_available_amount(sender, stream_id);
        assert!(available_amount > 0, error::invalid_argument(EINSUFFICIENT_BALANCE));
        
        // Update stream in stream module
        stream::update_stream_withdrawal(sender, stream_id, available_amount, current_time);
        
        // Emit withdraw event
        let flowfi = borrow_global_mut<FlowFiProtocol>(@flowfi);
        event::emit_event(
            &mut flowfi.withdraw_events,
            WithdrawEvent {
                stream_id,
                recipient: recipient_addr,
                amount: available_amount,
                timestamp: current_time,
            },
        );
    }

    // Cancel stream
    public entry fun cancel_stream<CoinType>(
        sender: &signer,
        stream_id: u64
    ) acquires FlowFiProtocol {
        let sender_addr = signer::address_of(sender);
        
        // Access stream information
        assert!(stream::stream_exists(sender_addr, stream_id), error::not_found(ESTREAM_NOT_FOUND));
        let (stream_sender, stream_recipient, _, _, _, total_amount, withdrawn_amount, status) = 
            stream::get_stream_info(sender_addr, stream_id);
        
        // Validate sender and stream status
        assert!(stream_sender == sender_addr, error::permission_denied(EUNAUTHORIZED));
        assert!(status == STREAM_STATUS_ACTIVE, error::invalid_state(ESTREAM_FINISHED));
        
        // Calculate amounts
        let current_time = timestamp::now_seconds();
        let available_amount = stream::get_available_amount(sender_addr, stream_id);
        let recipient_amount = available_amount;
        let sender_amount = total_amount - withdrawn_amount - recipient_amount;
        
        // Update stream in stream module
        stream::update_stream_status(sender_addr, stream_id, STREAM_STATUS_CANCELLED);
        
        // Emit cancel stream event
        let flowfi = borrow_global_mut<FlowFiProtocol>(@flowfi);
        event::emit_event(
            &mut flowfi.cancel_stream_events,
            CancelStreamEvent {
                stream_id,
                sender: sender_addr,
                recipient: stream_recipient,
                sender_amount,
                recipient_amount,
                timestamp: current_time,
            },
        );
    }

    // Get stream details
    #[view]
    public fun get_stream_details(
        sender: address,
        stream_id: u64
    ): (u64, address, address, u64, u64, u64, u64, u64, u64, u8) {
        assert!(stream::stream_exists(sender, stream_id), error::not_found(ESTREAM_NOT_FOUND));
        let (stream_sender, stream_recipient, start_time, end_time, rate_per_second, total_amount, withdrawn_amount, status) = 
            stream::get_stream_info(sender, stream_id);
        
        let duration = end_time - start_time;
        
        (
            stream_id,
            stream_sender,
            stream_recipient,
            total_amount,
            start_time,
            end_time,
            duration,
            rate_per_second,
            withdrawn_amount,
            status
        )
    }
}
