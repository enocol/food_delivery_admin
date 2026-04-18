import React from 'react'
import '../App.css'
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

     const handleAdd = () => {
    // after success
    navigate("/add");
  };

     const handleEdit = () => {
    // after success
    navigate("/edit");
  };

  return (
    <div className="container">
        <header className="home-header"> 
            <h1>MBOLO EATS DASHBOARD</h1>
        </header>
        <main className="main">

            <section className="home">
                <hr className="divider" />
                <div className="home-actions">
                    <button className="btn btn-primary" onClick={handleAdd}>
                        Add Restaurant
                    </button>
                    <button className="btn btn-primary" onClick={handleEdit}>
                        Edit Data
                    </button>
                </div>
            </section>



        </main>
    </div>
  )
}

export default Home