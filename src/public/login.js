// handle login via fetch and store user info

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message);

    if (result.success) {
        localStorage.setItem('username', result.username);
        localStorage.setItem('email', result.email);
        window.location.href = '/dashboard';
    }
});