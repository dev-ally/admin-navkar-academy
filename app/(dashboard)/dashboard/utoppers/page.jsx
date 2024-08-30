"use client";

import React, { useEffect, useState } from "react";
import { RiDragMove2Line } from "react-icons/ri";

const App = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Kristina Zasiadko",
      image:
        "https://media.geeksforgeeks.org/wp-content/uploads/20230816223829/geeksgforgeeks-logo-1.png",
    },
    {
      id: 2,
      name: "John Doe",
      image:
        "https://media.geeksforgeeks.org/wp-content/uploads/20230721212159/gfg-logo.jpeg",
    },
    {
      id: 3,
      name: "Jane Smith",
      image:
        "https://media.geeksforgeeks.org/wp-content/uploads/20230909123918/GeeksforGeeks-Wide-logo-black.png",
    },
    // Add more items here
  ]);

  const [draggingItem, setDraggingItem] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemImage, setNewItemImage] = useState("");

  useEffect(() => {
    console.log("USEEFFECT Items:", items);
  }, [items]);

  const handleDragStart = (e, item) => {
    setDraggingItem(item);
    e.dataTransfer.setData("text/plain", "");
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetItem) => {
    if (!draggingItem) return;

    const currentIndex = items.indexOf(draggingItem);
    const targetIndex = items.indexOf(targetItem);

    if (currentIndex !== -1 && targetIndex !== -1) {
      const newItems = [...items];
      newItems.splice(currentIndex, 1);
      newItems.splice(targetIndex, 0, draggingItem);
      setItems(newItems);
    }
    console.log("Dropped", draggingItem, "on", targetItem);
    console.log("New Items:", items);
  };

  const handleNameChange = (e) => {
    setNewItemName(e.target.value);
  };

  const handleImageChange = (e) => {
    setNewItemImage(e.target.value);
  };

  const addNewItem = () => {
    const newItemId = Math.max(...items.map((item) => item.id)) + 1;
    const newItem = {
      id: newItemId,
      name: newItemName,
      image: newItemImage,
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemImage("");
  };

  return (
    <div className="sortable-list">
      <div className="new-item">
        <input
          type="text"
          placeholder="Name"
          value={newItemName}
          onChange={handleNameChange}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={newItemImage}
          onChange={handleImageChange}
          className="input-field"
        />
        <button onClick={addNewItem} className="add-button">
          Add New Item
        </button>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          className={`item ${item === draggingItem ? "dragging" : ""}`}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, item)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, item)}
        >
          <div className="details">
            <img src={item.image} alt={item.name} />
            <span>{item.name}</span>
          </div>

          {/* Use the React icon component */}
          <RiDragMove2Line />
        </div>
      ))}
    </div>
  );
};

export default App;
