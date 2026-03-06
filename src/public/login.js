// handle login via fetch and store user info

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message);

    if (result.success) {
        localStorage.setItem('username', result.data.username);
        localStorage.setItem('email', result.data.email);
        window.location.href = '/dashboard';
    }
});