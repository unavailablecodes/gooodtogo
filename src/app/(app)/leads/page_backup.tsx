<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pet Profile Score</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #000; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .bg { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }
    .orb { position: absolute; border-radius: 50%; filter: blur(120px); animation: float 20s ease-in-out infinite; }
    .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(255,255,255,0.08), transparent); top: -150px; right: -100px; }
    .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,255,255,0.05), transparent); bottom: -100px; left: -100px; animation-delay: -10s; }
    .orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.04), transparent); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: -5s; }
    @keyframes float { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20px, -20px) scale(1.05); } }
    .container { max-width: 720px; width: 100%; padding: 64px 32px; text-align: center; position: relative; z-index: 1; }
    .icon { font-size: 52px; margin-bottom: 48px; display: block; filter: drop-shadow(0 0 30px rgba(255,255,255,0.1)); }
    .badge { display: inline-flex; align-items: center; gap: 10px; padding: 10px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 48px; }
    .badge-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 12px #22c55e; animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .headline { font-size: clamp(20px, 4.5vw, 42px); font-weight: 500; line-height: 1.1; letter-spacing: -0.02em; color: #fff; margin-bottom: 24px; }
    .sub { font-size: clamp(15px, 2vw, 18px); font-weight: 300; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 56px; }
    .form { max-width: 400px; margin: 0 auto; }
    .input-row { display: flex; gap: 12px; margin-bottom: 12px; }
    .input { flex: 1; padding: 18px 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; font-size: 16px; color: #fff; outline: none; font-family: inherit; transition: all 0.3s; }
    .input::placeholder { color: rgba(255,255,255,0.25); }
    .input:focus { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }
    .input-full { width: 100%; padding: 18px 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; font-size: 16px; color: #fff; outline: none; font-family: inherit; margin-bottom: 12px; }
    .input-full::placeholder { color: rgba(255,255,255,0.25); }
    .input-full:focus { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }
    .btn { width: 100%; padding: 18px 32px; background: #fff; border: none; border-radius: 14px; font-size: 16px; font-weight: 500; color: #000; cursor: pointer; font-family: inherit; transition: all 0.3s; margin-top: 4px; }
    .btn:hover { transform: translateY(-3px); box-shadow: 0 20px 60px rgba(255,255,255,0.2); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .note { font-size: 13px; color: rgba(255,255,255,0.3); margin-top: 16px; }
    .success { display: none; padding: 64px 0; }
    .success.show { display: block; }
    .success-icon { width: 88px; height: 88px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #fff; margin: 0 auto 32px; box-shadow: 0 0 80px rgba(34,197,94,0.4); }
    .success h2 { font-size: 36px; font-weight: 500; letter-spacing: -0.02em; margin-bottom: 12px; }
    .success p { font-size: 17px; color: rgba(255,255,255,0.5); font-weight: 300; }
    @media (max-width: 480px) { .input-row { flex-direction: column; } }
  </style>
</head>
<body>
  <div class="bg"><div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div></div>
  <div class="container">
    <div class="icon">🐾</div>
    <div class="badge"><span class="badge-dot"></span> Invite Only</div>
    <h1 class="headline"><span id="headline">Sound familiar? 'Dogs not allowed'</span></h1>
    <p class="sub">The trust standard for pets.</p>
    <div id="form">
      <form class="form" onsubmit="submit(event)">
        <div class="input-row">
          <input type="email" class="input" placeholder="Your email" required>
          <input type="text" class="input" placeholder="Name (optional)">
        </div>
        <input type="tel" class="input-full" placeholder="Phone (optional)">
        <button type="submit" class="btn" id="submitBtn">Request Access</button>
        <p class="note">We'll reach out when your access is ready.</p>
      </form>
    </div>
    <div class="success" id="success">
      <div class="success-icon">✓</div>
      <h2>You're on the list.</h2>
      <p>We'll reach out when your access is ready.</p>
    </div>
  </div>
  <script>
    var headlines = ["Sound familiar? 'Dogs not allowed'", "Good dogs denied due to breed", "One dog bit, all dogs banned", "Indian dogs deserve recognition", "Society says walk outside. Dark lanes. Strays. No safe zone.", "Behavior should matter, not the breed", "Stop punishing good pets", "Prove your dog is good"];
    var i = 0;
    var el = document.getElementById('headline');
    setInterval(function() { el.style.opacity = '0'; setTimeout(function() { i = (i + 1) % headlines.length; el.textContent = headlines[i]; el.style.opacity = '1'; }, 300); }, 3500);
    el.style.transition = 'opacity 0.3s';
    function submit(e) {
      e.preventDefault();
      var form = e.target;
      var email = form.querySelector('input[type="email"]').value;
      var name = form.querySelector('input[placeholder="Name (optional)"]').value;
      var phone = form.querySelector('input[type="tel"]').value;
      var btn = document.getElementById('submitBtn');
      btn.textContent = 'Submitting...';
      btn.disabled = true;
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, name: name, phone: phone, screen: screen.width + 'x' + screen.height })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        document.getElementById('form').style.display = 'none';
        document.getElementById('success').classList.add('show');
      })
      .catch(function(err) {
        btn.textContent = 'Error. Try again.';
        btn.disabled = false;
      });
    }
  </script>
</body>
</html>