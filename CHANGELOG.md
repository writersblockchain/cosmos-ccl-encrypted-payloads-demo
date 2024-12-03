# Chandelog:


## SDK

*   **Namespace Update:**  Structuires and function inder `sdk::common::*` has been expanded and  now exposed under sdk::*. given there is a specified feature flag. All components previously under common are now directly accessible at the sdk level.
*  **Replay Attack Protection for Querties:** Introduced `check_data` method on `CosmosAuthData`. This method ensures that the signature is intended for the current contract on the current chain ID and adds a nonce to protect against replay attacks.
*  **Methods of `CosmosAuthData` in exception for verify do not require API Argument:** The api argument has been removed from all methods responsible for generating addresses from public keys, as well as from higher-level methods where it was being unnecessarily passed down.


## Contracts

* Renamed `gateway-simple` into `storead-secrets`
* Added `sealed-bid-auctions` and `secret-voting` contracts
* Authenticated query messages are now protected again replay attacks and messages are now required to be signed in a specifc way


## Typesctipt / Tests

* MultiContract config types, primtivies and values
* Required `contract` arguments on may gateway utilities


## NextJs

* Demo case select menu
* Chain selector (Osmosis + Cosmoshub)
* Secret Voting and Seaked-Bid-Auction integration
