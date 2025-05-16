module flowfi::stream {
    use std::error;
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};

    // Error codes
    const ESTREAM_NOT_FOUND: u64 = 1;
    const ESTREAM_ALREADY_EXISTS: u64 = 2;
    const EINVALID_DURATION: u64 = 3;
    const EINVALID_RATE: u64 = 4;
    const EINSUFFICIENT_BALANCE: u64 = 5;
    const ESTREAM_FINISHED: u64 = 6;
    const EUNAUTHORIZED: u64 = 7;
    const ESTREAM_ACTIVE: u64 = 8;

    // Stream status enum
    const STREAM_STATUS_ACTIVE: u8 = 1;
    const STREAM_STATUS_PAUSED: u8 = 2;
    const STREAM_STATUS_CANCELLED: u8 = 3;
    const STREAM_STATUS_COMPLETED: u8 = 4;

    // Stream structure
    struct Stream has store, drop {
        id: u64,
        sender: address,
        recipient: address,
        deposit_amount: u64,
        start_time: u64,
        end_time: u64,
        duration: u64,
        rate_per_second: u64,
        withdrawn_amount: u64,
        status: u8,
        last_update_time: u64,
    }

    // Streams resource
    struct Streams has key {
        streams: Table<u64, Stream>,
        next_stream_id: u64,
    }

    // Initialize Streams resource
    public fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        if (!exists<Streams>(account_addr)) {
            move_to(account, Streams {
                streams: table::new(),
                next_stream_id: 1,
            });
        }
    }
    
    // Create a stream in the stream registry
    public fun create_stream(
        sender: address,
        recipient: address,
        stream_id: u64,
        deposit_amount: u64,
        start_time: u64,
        end_time: u64,
        duration: u64,
        rate_per_second: u64,
        status: u8
    ) acquires Streams {
        let streams = borrow_global_mut<Streams>(@flowfi);
        
        // Create stream
        let stream = Stream {
            id: stream_id,
            sender,
            recipient,
            deposit_amount,
            start_time,
            end_time,
            duration,
            rate_per_second,
            withdrawn_amount: 0,
            status,
            last_update_time: start_time,
        };
        
        // Add to registry
        table::add(&mut streams.streams, stream_id, stream);
    }
    
    // Update stream after withdrawal
    public fun update_stream_withdrawal(
        sender: address,
        stream_id: u64,
        amount_withdrawn: u64,
        current_time: u64
    ) acquires Streams {
        let streams = borrow_global_mut<Streams>(@flowfi);
        let stream = table::borrow_mut(&mut streams.streams, stream_id);
        
        // Update stream
        stream.withdrawn_amount = stream.withdrawn_amount + amount_withdrawn;
        stream.last_update_time = current_time;
        
        // Check if stream completed
        if (current_time >= stream.end_time || stream.withdrawn_amount == stream.deposit_amount) {
            stream.status = STREAM_STATUS_COMPLETED;
        }
    }
    
    // Update stream status
    public fun update_stream_status(
        sender: address,
        stream_id: u64,
        new_status: u8
    ) acquires Streams {
        let streams = borrow_global_mut<Streams>(@flowfi);
        let stream = table::borrow_mut(&mut streams.streams, stream_id);
        
        // Update status
        stream.status = new_status;
    }

    // Calculate available amount to withdraw
    public fun get_available_amount(sender: address, stream_id: u64): u64 acquires Streams {
        let streams = borrow_global<Streams>(@flowfi);
        assert!(table::contains(&streams.streams, stream_id), error::not_found(ESTREAM_NOT_FOUND));
        
        let stream = table::borrow(&streams.streams, stream_id);
        
        let current_time = timestamp::now_seconds();
        
        // Not started yet
        if (current_time < stream.start_time) {
            return 0
        };
        
        // Already completed
        if (stream.status != STREAM_STATUS_ACTIVE) {
            return 0
        };
        
        // Calculate elapsed time for this update
        let elapsed_time = if (current_time >= stream.end_time) {
            // Stream has ended
            stream.end_time - stream.last_update_time
        } else {
            // Stream is ongoing
            current_time - stream.last_update_time
        };
        
        // Calculate amount streamed in this period
        let amount_per_period = elapsed_time * stream.rate_per_second;
        
        // Ensure we don't exceed the total amount
        let remaining = stream.deposit_amount - stream.withdrawn_amount;
        if (amount_per_period > remaining) {
            remaining
        } else {
            amount_per_period
        }
    }

    // Get stream info
    public fun get_stream_info(sender: address, stream_id: u64): (address, address, u64, u64, u64, u64, u64, u8) acquires Streams {
        let streams = borrow_global<Streams>(@flowfi);
        assert!(table::contains(&streams.streams, stream_id), error::not_found(ESTREAM_NOT_FOUND));
        
        let stream = table::borrow(&streams.streams, stream_id);
        
        (
            stream.sender,
            stream.recipient,
            stream.start_time,
            stream.end_time,
            stream.rate_per_second,
            stream.deposit_amount,
            stream.withdrawn_amount,
            stream.status
        )
    }

    // Check if stream exists
    public fun stream_exists(sender: address, stream_id: u64): bool acquires Streams {
        if (!exists<Streams>(@flowfi)) {
            return false
        };
        let streams = borrow_global<Streams>(@flowfi);
        table::contains(&streams.streams, stream_id)
    }
}
