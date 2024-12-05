use std::fmt::Display;

use cosmwasm_std::{ensure, ensure_eq,  Api, StdError, StdResult, from_binary, Storage, Env,};

use crate::{
    crypto::{verify_arbitrary, pubkey_to_address}, 
    CosmosAuthData, CosmosCredential
};


impl<M : Display> CosmosCredential<M> {

    pub fn address(&self) -> StdResult<String> {
        let addr = pubkey_to_address(&self.pubkey, &self.hrp)?;
        Ok(addr)
    }

    pub fn id(&self) -> Vec<u8> {
        self.pubkey.0.clone()
    }
}



impl CosmosAuthData {
    pub fn validate(&self) -> StdResult<()> {
        let length = self.credentials.len();
        ensure!(length > 0, StdError::generic_err("Credentials must not be empty"));
        ensure!(length < 256, StdError::generic_err("Credentials number must not exceed 256"));
        if let Some(i) = self.primary_index {
            ensure!(i < length as u8, StdError::generic_err("Primary index is out of bounds"));
        }
        Ok(())
    }

    pub fn verify(&self, api: &dyn Api) -> StdResult<()> {
        self.validate()?;
        self.credentials
            .iter()
            .map(|c| verify_arbitrary(api, c))
            .collect::<StdResult<Vec<String>>>()?;
        Ok(())
    }

    pub fn primary(&self) -> CosmosCredential {
        match self.primary_index {
            Some(i) => self.credentials[i as usize].clone(),
            None => self.credentials[0].clone(),
        }
    }

    pub fn primary_id(&self) -> Vec<u8> {
        self.primary().id()
    }


    pub fn primary_address(&self) -> StdResult<String> {
        self.primary().address()
    }


    pub fn secondaries(&self) -> Vec<CosmosCredential> {
        match self.primary_index {
            None => self.credentials[1..].to_vec(),
            Some(i) => self.credentials
                        .iter()
                        .enumerate()
                        .filter_map(|(j, c)| 
                            if j != i as usize { Some(c.clone()) } else { None }
                        )
                        .collect()
            }
    }

    pub fn ids(&self) -> Vec<Vec<u8>> {
        self.credentials.iter().map(|c| c.id()).collect()
    }

    pub fn secondary_ids(&self) -> Vec<Vec<u8>> {
        self.secondaries().iter().map(|c| c.id()).collect()
    }
    

    pub fn secondary_addresses(&self) -> StdResult<Vec<String>> {
        self.secondaries().iter().map(|c| c.address()).collect()
    }

    #[cfg(feature = "common")]
    pub fn check_data(
        &self, 
        storage: &dyn Storage,
        env: &Env,
    ) -> StdResult<()> {
        use crate::{DataToSign, NONCES};
        for cred in self.credentials.iter() {
            let data : DataToSign = from_binary(&cred.message)?;
            ensure_eq!(data.chain_id, env.block.chain_id, StdError::generic_err("Chain ID mismatch"));
            ensure_eq!(data.contract_address, env.contract.address, StdError::generic_err("Contract address mismatch"));
            ensure!(!NONCES.contains(storage, &data.nonce.0), StdError::generic_err("Nonce already used"));
        }
        Ok(())
    }
}





