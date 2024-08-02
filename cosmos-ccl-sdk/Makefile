.PHONY: build-mainnet _build-mainnet compress-wasm
SUBDIR := contracts/gateway-simple
ROOT_DIR := ..

build-mainnet: _build-mainnet compress-wasm

_build-mainnet:
	cd $(SUBDIR) && RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown
	
