import { useEffect, useState } from "react";
import { adminApi } from "../services/adminApi";
import "./Categories.css";

const Categories = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminApi.categories();
      setCategories(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const submit = async (e) => {
    try {
      e.preventDefault();
      await adminApi.createCategory({ name, description });
      setName("");
      setDescription("");
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
    }
  };

  const edit = async (category) => {
    try {
      const newName = prompt("Update category name", category.name);
      if (!newName) return;
      await adminApi.updateCategory(category._id, { name: newName });
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update category");
    }
  };

  const remove = async (id) => {
    try {
      await adminApi.deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <section className="admin-page">
      <h2>Category Management</h2>

      <form className="category-form" onSubmit={submit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          required
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <button type="submit">Add Category</button>
      </form>

      {loading && <p className="admin-loading">Loading categories...</p>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category.description || "-"}</td>
                  <td className="admin-actions">
                    <button onClick={() => edit(category)}>Edit</button>
                    <button className="danger" onClick={() => remove(category._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default Categories;
