import { useEffect, useState } from "react";
import { getNews } from "../../api/external";
import styles from './Home.module.css';
import Loader from "../../components/Loader/Loader";

function Home (){

    const [articles, setArticles] = useState([]);

    useEffect(() => {
        (async function newsApiCall() {
            const response = await getNews();
            setArticles(response);
        })()

        return () => {
            setArticles([]);
        }
    }, []);

    const handleCardClick = (url) => {
        window.open(url, '_blank');
    }

    if(articles.length === 0){
        return <Loader text="..." />
    }

    return(
        <>
            <div className={styles.header}>Latest Articles</div>
            <div className={styles.grid}>{
                articles.map((article) => {
                    return(
                        <div key={article.url} className={styles.card} onClick={() => handleCardClick(article.url)} >
                            <img alt={article.title} src={article.urlToImage} />
                            <h3>{article.title}</h3>
                        </div>
                    )
                })    
            }</div>
        </>
    )
}

export default Home;