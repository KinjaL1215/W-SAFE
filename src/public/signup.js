async function sendOTP() {
    const email = document.querySelector('input[name="email"]').value;
    const otpBtn = document.getElementById('otpBtn');

    if (!email) {
        alert("Enter email first!");
        return;
    }

    const res = await fetch('/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
        // show OTP input
        document.getElementById('otpLabel').style.display = 'block';
        document.getElementById('otpInput').style.display = 'block';
        document.getElementById('signupBtn').style.display = 'block';

        // disable button with timer
        let time = 30;
        otpBtn.disabled = true;

        const interval = setInterval(() => {
            otpBtn.innerText = `Resend in ${time}s`;
            time--;

            if (time < 0) {
                clearInterval(interval);
                otpBtn.disabled = false;
                otpBtn.innerText = "Resend OTP 🔄";
            }
        }, 1000);
    }
}

// Signup submit
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message);

    if (result.message.includes("successful")) {
        window.location.href = "/login";
    }
});