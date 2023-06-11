import {ConnectButton} from "web3uikit"

const Header = () => {
    return (
        <nav className="header">
            <ConnectButton moralisAuth={false} />
        </nav>
    )
}

export default Header;