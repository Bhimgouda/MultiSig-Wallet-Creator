import axios from 'axios';

export const verifyContractOnPolygon = async (apiKey, contractAddress, contractAbi) => {
    try {
      const formData = new FormData();
      formData.append('apikey', apiKey);
      formData.append('module', 'contract');
      formData.append('action', 'verifysourcecode');
      formData.append('contractaddress', contractAddress);
      formData.append('sourceCode', contractAbi);
  
      const response = await axios.post('https://api.polygonscan.com/api', formData);
  
      if (response.data.status === '1') {
        console.log('Contract verification successful!');
        console.log('Verification status:', response.data.message);
        console.log('Contract address:', contractAddress);
        console.log('Transaction hash:', response.data.result);
      } else {
        console.error('Contract verification failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error occurred during contract verification:', error);
    }
};

export const verifyContractOnEtherscan = async (apiKey, contractAddress, contractAbi) => {
    try {
      const formData = new FormData();
      formData.append('apikey', apiKey);
      formData.append('module', 'contract');
      formData.append('action', 'verifysourcecode');
      formData.append('address', contractAddress);
      formData.append('contractABI', contractAbi);
      formData.append('contractname', 'MultiSigWallet');
  
      const response = await axios.post('https://api.etherscan.io/api', formData);
  
      if (response.data.status === '1') {
        console.log('Contract verification successful!');
        console.log('Verification status:', response.data.result);
        console.log('Contract address:', contractAddress);
        console.log('Transaction hash:', response.data.message);
      } else {
        console.error('Contract verification failed:', response.data.result);
      }
    } catch (error) {
      console.error('Error occurred during contract verification:', error);
    }
  };
  