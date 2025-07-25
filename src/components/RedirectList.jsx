// client/src/components/RedirectList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// กำหนด Base URL ของ API จาก Environment Variable
// เราจะใช้ process.env.VITE_API_BASE_URL ซึ่งจะถูกกำหนดค่าผ่าน vite.config.js (define)
// และจะถูกแทนที่ด้วยค่าจาก Netlify Environment Variables ตอน Build
const API_BASE_URL = process.env.VITE_API_BASE_URL;

// URL สำหรับ Go Link (จะดึงมาจาก Backend URL เดียวกัน)
// ตรวจสอบว่า API_BASE_URL มีค่าก่อนที่จะ replace
const GO_BASE_URL = API_BASE_URL ? API_BASE_URL.replace('/api/redirects', '/go/') : '';

function RedirectList() {
    const [redirects, setRedirects] = useState([]);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [currentEditData, setCurrentEditData] = useState(null);

    useEffect(() => {
        fetchRedirects();
    }, []);

    const fetchRedirects = async () => {
        setLoading(true);
        setError(null);
        // *** เพิ่มการตรวจสอบ API_BASE_URL ที่นี่ก่อนเรียก API ***
        if (!API_BASE_URL || API_BASE_URL === 'undefined' || API_BASE_URL === '') {
            setError("Configuration Error: Backend API URL is missing. Please contact support.");
            setLoading(false);
            return; // หยุดการทำงานถ้า URL ไม่ถูกต้อง
        }
        try {
            const response = await axios.get(API_BASE_URL);
            setRedirects(response.data);
        } catch (err) {
            setError('Failed to fetch redirects. Please check backend server status and CORS settings. (Backend API: ' + API_BASE_URL + ')');
            console.error('Error fetching redirects from:', API_BASE_URL, err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCompany = async () => {
        if (!newCompanyName.trim()) {
            alert('Company name cannot be empty.');
            return;
        }
        // ตรวจสอบ API_BASE_URL ก่อนเรียก axios.post
        if (!API_BASE_URL || API_BASE_URL === 'undefined' || API_BASE_URL === '') {
            alert("Cannot add company: Backend API URL is not configured.");
            return;
        }
        try {
            const response = await axios.post(API_BASE_URL, { companyName: newCompanyName.trim() });
            setRedirects([...redirects, response.data]);
            setNewCompanyName('');
            alert('Company added successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add company.');
            console.error('Error adding company:', err);
        }
    };

    const handleDeleteCompany = async (id) => {
        if (!window.confirm('Are you sure you want to delete this company and all its links?')) {
            return;
        }
        // ตรวจสอบ API_BASE_URL ก่อนเรียก axios.delete
        if (!API_BASE_URL || API_BASE_URL === 'undefined' || API_BASE_URL === '') {
            alert("Cannot delete company: Backend API URL is not configured.");
            return;
        }
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            setRedirects(redirects.filter(r => r._id !== id));
            alert('Company deleted successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete company.');
            console.error('Error deleting company:', err);
        }
    };

    const handleEditCompany = (redirect) => {
        setEditingId(redirect._id);
        setCurrentEditData(JSON.parse(JSON.stringify(redirect)));
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setCurrentEditData(null);
    };

    const handleLinkChange = (linkIndex, field, value) => {
        const updatedLinks = [...currentEditData.targetLinks];
        updatedLinks[linkIndex][field] = value;
        setCurrentEditData({ ...currentEditData, targetLinks: updatedLinks });
    };

    const handleAddLink = () => {
        const newLink = { name: `New Link ${currentEditData.targetLinks.length + 1}`, url: '', active: true, hits: 0 };
        setCurrentEditData({
            ...currentEditData,
            targetLinks: [...currentEditData.targetLinks, newLink],
        });
    };

    const handleRemoveLink = (linkIndex) => {
        const updatedLinks = currentEditData.targetLinks.filter((_, idx) => idx !== linkIndex);
        setCurrentEditData({ ...currentEditData, targetLinks: updatedLinks });
    };

    const handleSaveCompany = async () => {
        if (!currentEditData.companyName.trim()) {
            alert('Company name cannot be empty.');
            return;
        }
        const invalidUrls = currentEditData.targetLinks.some(link => link.active && (!link.url || !link.url.startsWith('http')));
        if (invalidUrls) {
            alert('All active links must have a valid URL (starting with http/https).');
            return;
        }
        // ตรวจสอบ API_BASE_URL ก่อนเรียก axios.put
        if (!API_BASE_URL || API_BASE_URL === 'undefined' || API_BASE_URL === '') {
            alert("Cannot save company: Backend API URL is not configured.");
            return;
        }
        try {
            const response = await axios.put(`${API_BASE_URL}/${editingId}`, currentEditData);
            setRedirects(redirects.map(r => (r._id === editingId ? response.data : r)));
            setEditingId(null);
            setCurrentEditData(null);
            alert('Company and links updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update company and links.');
            console.error('Error updating company:', err);
        }
    };

    const copyLinkToClipboard = (shortCode) => {
        const link = `${GO_BASE_URL}${shortCode}`;
        navigator.clipboard.writeText(link).then(() => {
            alert(`Link copied: ${link}`);
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            alert('Failed to copy link. Please copy manually: ' + link);
        });
    };

    if (loading) return <div className="loading">Loading redirects...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="redirect-list-container">
            <h2>Manage Redirects</h2>

            <div className="add-company-section">
                <input
                    type="text"
                    placeholder="New Company Name"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                />
                <button onClick={handleAddCompany}>Add Company</button>
            </div>

            <div className="company-cards-grid">
                {redirects.length === 0 ? (
                    <p>No redirect companies found. Add a new one!</p>
                ) : (
                    redirects.map((redirect) => (
                        <div key={redirect._id} className="company-card">
                            {editingId === redirect._id ? (
                                // Edit Mode
                                <div className="edit-form">
                                    <h3>
                                        <input
                                            type="text"
                                            value={currentEditData.companyName}
                                            onChange={(e) => setCurrentEditData({ ...currentEditData, companyName: e.target.value })}
                                        />
                                    </h3>
                                    <p>
                                        Go Link: {GO_BASE_URL}
                                        {currentEditData.shortCode}
                                        <button onClick={() => copyLinkToClipboard(currentEditData.shortCode)}>
                                            Copy
                                        </button>
                                    </p>

                                    <h4>Target Links:</h4>
                                    {currentEditData.targetLinks.length === 0 ? (
                                        <p>No links yet. Add one!</p>
                                    ) : (
                                        currentEditData.targetLinks.map((link, linkIndex) => (
                                            <div key={linkIndex} className="target-link-item">
                                                <input
                                                    type="checkbox"
                                                    checked={link.active}
                                                    onChange={(e) => handleLinkChange(linkIndex, 'active', e.target.checked)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Link Name"
                                                    value={link.name}
                                                    onChange={(e) => handleLinkChange(linkIndex, 'name', e.target.value)}
                                                />
                                                <input
                                                    type="url"
                                                    placeholder="https://example.com/link"
                                                    value={link.url}
                                                    onChange={(e) => handleLinkChange(linkIndex, 'url', e.target.value)}
                                                />
                                                <span className="hits-count">Hits: {link.hits}</span>
                                                <button onClick={() => handleRemoveLink(linkIndex)}>Remove</button>
                                            </div>
                                        ))
                                    )}
                                    <button onClick={handleAddLink}>Add New Link</button>
                                    <div className="action-buttons">
                                        <button onClick={handleSaveCompany} className="save-button">Save</button>
                                        <button onClick={handleCancelEdit} className="cancel-button">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div>
                                    <h3>{redirect.companyName}</h3>
                                    <p>Go Link: <a href={`${GO_BASE_URL}${redirect.shortCode}`} target="_blank" rel="noopener noreferrer">{GO_BASE_URL}{redirect.shortCode}</a>
                                        <button onClick={() => copyLinkToClipboard(redirect.shortCode)}>Copy</button>
                                    </p>

                                    <h4>Target Links:</h4>
                                    {redirect.targetLinks.length === 0 ? (
                                        <p>No links configured.</p>
                                    ) : (
                                        <ul>
                                            {redirect.targetLinks.map((link, index) => (
                                                <li key={index} className={link.active ? 'active-link' : 'inactive-link'}>
                                                    {link.name}: <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a> ({link.active ? 'Active' : 'Inactive'}) - Hits: {link.hits}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <div className="action-buttons">
                                        <button onClick={() => handleEditCompany(redirect)}>Edit</button>
                                        <button onClick={() => handleDeleteCompany(redirect._id)} className="delete-button">Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default RedirectList;