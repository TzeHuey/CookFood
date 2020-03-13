import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthProvider";
import "./index.css";
import { appAuth, appDB } from "./FirebaseInit";
import FavList from "./FavList";
import FavRecipe from "./FavRecipe";

function Account(props) {
  const { currentUser } = useContext(AuthContext);
  const [favRecipes, setFavRecipes] = useState([]);
  const [showRecipe, setShowRecipe] = useState(null);

  useEffect(() => {
    if (currentUser) {
      appDB
        .collection("users")
        .doc(currentUser.uid)
        .collection("favorites")
        .onSnapshot(
          snapshot => {
            setFavorites(snapshot);
          },
          err => {
            console.log(err);
          }
        );
    } else {
      setFavorites([]);
    }
  }, [currentUser]);

  function setFavorites(data) {
    if (data.length !== 0) {
      data.forEach(doc => {
        const recipe = doc.data();
        recipe.id = doc.id;
        setFavRecipes(prev => {
          return [...prev, recipe];
        });
      });
    }
  }

  function handleClick(event) {
    event.preventDefault();
    setShowRecipe(favRecipes.filter(item => item.idMeal === event.target.id));
    if (window.document.body.clientWidth > 800) {
      window.scrollTo(0, 0);
    }
  }

  function handleDelete(event) {
    event.preventDefault();

    appDB
      .collection("users")
      .doc(currentUser.uid)
      .collection("favorites")
      .doc(event.target.id)
      .delete()
      .catch(err => {
        console.log(err.message);
      });
    setFavRecipes([]);
  }

  return (
    <div>
      <nav className="navbar fixed-top navbar-light ">
        <div>
          <div
            id="navHeader"
            className="navbar-brand"
            onClick={props.onHomeClick}
          >
            <span className="desktop">Random recipe </span>
            <span className="mobile">Recipe </span>generator
          </div>
        </div>
        <div className="navbar-button-block">
          <p>{currentUser ? currentUser.email : null}</p>

          <div className="loggedin">
            <button
              className="btn btn-outline-secondary btn-sm loggedin"
              id="logout"
              onClick={() => appAuth.auth().signOut()}
            >
              Log out
            </button>
          </div>
        </div>
      </nav>
      <div id="account-content">
        <div id="fav-list">
          {favRecipes.length > 0 ? (
            <FavList
              recipes={favRecipes}
              onClick={handleClick}
              onDelete={handleDelete}
            />
          ) : (
            <p>Add recipes to your favorites to see them here</p>
          )}
        </div>
        {showRecipe !== null ? (
          <div id="fav-recipe">
            <FavRecipe recipe={showRecipe} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Account;
