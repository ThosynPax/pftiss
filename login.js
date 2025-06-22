document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Demo credentials
        const demoEmail = 'demo@pftiss.africa';
        const demoPassword = 'pftiss2025';
        
        if (email === demoEmail && password === demoPassword) {
            // Store login state in localStorage
            localStorage.setItem('pftiss-loggedIn', 'true');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials. For demo purposes, use email: demo@pftiss.africa and password: pftiss2025');
        }
    });
    
    // Check if user is already logged in
    if (localStorage.getItem('pftiss-loggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
});