import { useRef } from "react";
import truncateStr from "../utils/truncate";

const Owners = ({owners}) => {
    const ownerAddressRef = useRef(null);

    const handleCopyClick = () => {
        if (ownerAddressRef.current) {
          const range = document.createRange();
          range.selectNode(ownerAddressRef.current);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
          document.execCommand('copy');
          window.getSelection().removeAllRanges();
        }
    };

    return ( 
        <div className="container wallet__deposit">
            <h2 style={{textAlign: "center", fontWeight: "lighter", marginBottom: "15px"}}>Owners</h2>
            <div style={{height: "100px"}} className="container scrollable">
                {owners.map(owner=>(
                    <p ref={ownerAddressRef} onClick={handleCopyClick} style={{fontSize: "12px", marginBottom: "10px", marginRight: "5px"}} className='address '>
                        <img className='icon icon--small icon--copy' src="/icons/copy.svg" alt="" />
                        {truncateStr(owner, 28)}
                    </p>
                ))}
            </div>
        </div>
     );
}
 
export default Owners;