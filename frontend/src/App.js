import "./App.css";
import { WalletIcon } from "@heroicons/react/24/outline";
import { SecretjsContext } from "./components/SecretjsContext";
import { useContext } from "react";
import EncryptModal from './components/EncryptModal';

function App() {
  const { connectWallet } = useContext(SecretjsContext);

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex justify-end -mr-9 ml-12"> {/* Adjusted margin here */}
            <WalletIcon
              onClick={connectWallet}
              className="h-10 w-10 text-brand-orange hover:text-brand-blue wallet-icon"
            />
          </div>
          <EncryptModal />
        </div>
      </div>
    </>
  );
}

export default App;
