use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("This contract is stopped")]
    Stopped {},

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Proposal not found")]
    NotFound {},

    #[error("Proposal expired")]
    Expired {},

    #[error("List of allowed code ids cannot be empty")]
    EmptyAllowedCodeIds {},

    #[error("This address is unauthorized and/or viewing key is not valid")]
    ViewingKeyOrUnauthorized {},

    #[error("Submessage (id: {id:?}) reply cannot be parsed.")]
    ParseReplyError { id: u64 },

    #[error("Unknown reply id: {id:?}")]
    UnexpectedReplyId { id: u64 },

    /// Whenever UTF-8 bytes cannot be decoded into a unicode string, e.g. in String::from_utf8 or str::from_utf8.
    #[error("Cannot decode UTF8 bytes into string: {msg}")]
    InvalidUtf8 { msg: String },

    #[error("Custom Error val: {val:?}")]
    CustomError { val: String },
    // Add any other custom errors you like here.
    // Look at https://docs.rs/thiserror/1.0.21/thiserror/ for details.
}

impl ContractError {
    pub fn invalid_utf8(msg: impl ToString) -> Self {
        ContractError::InvalidUtf8 {
            msg: msg.to_string(),
        }
    }
}

impl From<std::str::Utf8Error> for ContractError {
    fn from(source: std::str::Utf8Error) -> Self {
        Self::invalid_utf8(source)
    }
}

impl From<std::string::FromUtf8Error> for ContractError {
    fn from(source: std::string::FromUtf8Error) -> Self {
        Self::invalid_utf8(source)
    }
}
