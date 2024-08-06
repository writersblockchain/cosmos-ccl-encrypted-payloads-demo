export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const getPermit = async (client, contractAddress, chainId) => {
    return await client.utils.accessControl.permit.sign(client.address, chainId, "my-permit", [contractAddress], ["owner"], false);
};
