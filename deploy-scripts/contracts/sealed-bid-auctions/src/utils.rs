pub fn calculate_future_block_height(current_block_height: u64, minutes_into_future: u64) -> u64 {
    let average_block_time_seconds = 6; // Rounded average block time in seconds for simplification
    let seconds_into_future = minutes_into_future * 60; // Convert minutes into seconds

    // Calculate how many blocks will be produced in that time using integer arithmetic
    let blocks_to_be_added = seconds_into_future / average_block_time_seconds;

    // Calculate and return the future block height
    current_block_height + blocks_to_be_added as u64
}   