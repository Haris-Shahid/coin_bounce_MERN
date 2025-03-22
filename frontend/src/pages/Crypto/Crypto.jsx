import { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import { getCrypto } from "../../api/external";
import styles from "./Crypto.module.css";

function Crypto() {

    const [data, setData] = useState([]);


    useEffect(() => {

        (async function cryptoApiCall() {
            const response = await getCrypto();
            setData(response);
        })();

        return () => {
            setData([]);
        }

    }, [])

    if (data.length === 0) {
        return <Loader text='...' />
    }

    const negativeStyle = {
        color: '#ea3943'
    }

    const positiveStyle = {
        color: '#16c784'
    }

    return (
        <table className={styles.table} >
            <thead>
                <tr className={styles.head} >
                    <th>#</th>
                    <th>Coin</th>
                    <th>Symbol</th>
                    <th>Price</th>
                    <th>24</th>
                </tr>
            </thead>
            <tbody>
                {
                    data.map((coin) => {
                        return(
                            <tr id={coin.id} key={coin.id} className={styles.tableRow} >
                                <td>{coin.market_cap_rank}</td>
                                <td>
                                    <div className={styles.logo} >
                                        <img alt={coin.symbol} src={coin.image} height={40} width={40} /> {coin.name}
                                    </div>
                                </td>
                                <td>
                                    <div className={coin.symbol} >
                                        {coin.symbol}
                                    </div>
                                </td>
                                <td>{coin.current_price}</td>
                                <td style={coin.price_change_percentage_24h < 0 ? negativeStyle : positiveStyle} >{coin.price_change_percentage_24h}</td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    )
}

export default Crypto;