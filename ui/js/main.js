document.addEventListener('DOMContentLoaded', () => {
    // Highlight active nav link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Handle Prediction Form
    const predictForm = document.getElementById('prediction-form');
    if (predictForm) {
        predictForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = predictForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            // UI Transition to processing
            document.getElementById('initial-state')?.classList.add('hidden');
            document.getElementById('prediction-result')?.classList.add('hidden');
            document.getElementById('processing-state')?.classList.remove('hidden');

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="heartbeat inline-block">❤️</span> Analyzing...';

            const formData = new FormData(predictForm);
            const rawData = Object.fromEntries(formData.entries());

            // Convert data to exact formats/types expected by app.py & models.pkl
            const payload = {
                age: parseInt(rawData.age),
                gender: parseInt(rawData.gender),
                height: parseInt(rawData.height),
                weight: parseFloat(rawData.weight),
                ap_hi: parseInt(rawData.ap_hi),
                ap_lo: parseInt(rawData.ap_lo),
                cholesterol: parseInt(rawData.cholesterol),
                gluc: parseInt(rawData.gluc),
                smoke: rawData.smoke === 'on' ? 1 : 0,
                alco: rawData.alco === 'on' ? 1 : 0,
                active: rawData.active === 'on' ? 1 : 0
            };

            try {
                const response = await fetch("/predict", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Backend response was not ok');

                const result = await response.json();

                // UI Transition Delay for ECG effect
                setTimeout(() => {
                    displayResult({
                        risk: result.risk_level, // Matches contract: "Low / Medium / High"
                        probability: result.probability,
                        prediction: result.prediction
                    });

                    document.getElementById('processing-state')?.classList.add('hidden');
                    document.getElementById('prediction-result')?.classList.remove('hidden');

                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;

                    // Update Guidance Link
                    const guidanceLink = document.getElementById('view-guidance');
                    if (guidanceLink) {
                        guidanceLink.href = `guidance.html?risk=${result.risk_level}`;
                    }
                }, 2000);

            } catch (error) {
                console.error('API Error:', error);
                document.getElementById('processing-state')?.classList.add('hidden');
                document.getElementById('initial-state')?.classList.remove('hidden');
                alert('Analysis failed. Please ensure the backend server (app.py) is running and accessible.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Handle Guidance Page Logic
    if (window.location.pathname.includes('guidance.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const risk = urlParams.get('risk') || 'Low';

        const positiveContent = document.getElementById('positive-guidance');
        const warningContent = document.getElementById('warning-guidance');
        const headerText = document.getElementById('guidance-header');

        if (risk === 'High' || risk === 'Medium') {
            warningContent.classList.remove('hidden');
            positiveContent.classList.add('hidden');
            headerText.innerText = `Precision Guidance: ${risk} Risk Analysis`;
            headerText.classList.add('text-red-600');
        } else {
            positiveContent.classList.remove('hidden');
            warningContent.classList.add('hidden');
            headerText.innerText = "Wellness Strategy for Peak Heart Health";
            headerText.classList.add('text-green-600');
        }
    }

    // Mobile Hamburger Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            // Animate hamburger spans if needed (optional refinement)
        });

        // Close menu when clicking outside or on a link
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navLinksContainer.contains(e.target)) {
                navLinksContainer.classList.remove('active');
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('active');
            });
        });
    }
});

function displayResult(result) {
    const riskLabel = document.getElementById('risk-label');
    const probabilityText = document.getElementById('probability-text');
    const riskBadge = document.getElementById('risk-badge');
    const gaugeFill = document.getElementById('gauge-fill');
    const resultHeart = document.getElementById('result-heart');

    riskLabel.innerText = result.risk;
    probabilityText.innerText = `${(result.probability * 100).toFixed(1)}%`;

    // Result styling
    riskBadge.className = 'px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block ';

    if (result.risk === 'Low') {
        riskBadge.classList.add('bg-green-100', 'text-green-700');
        riskLabel.className = 'text-4xl font-black text-green-600';
        gaugeFill.style.width = `${result.probability * 100}%`;
        gaugeFill.style.backgroundColor = '#10b981';
        resultHeart.classList.remove('text-red-500');
        resultHeart.classList.add('text-green-500');
    } else if (result.risk === 'Medium') {
        riskBadge.classList.add('bg-yellow-100', 'text-yellow-700');
        riskLabel.className = 'text-4xl font-black text-yellow-500';
        gaugeFill.style.width = `${result.probability * 100}%`;
        gaugeFill.style.backgroundColor = '#f59e0b';
        resultHeart.classList.remove('text-red-500');
        resultHeart.classList.add('text-yellow-500');
    } else {
        riskBadge.classList.add('bg-red-100', 'text-red-700');
        riskLabel.className = 'text-4xl font-black text-red-600';
        gaugeFill.style.width = `${result.probability * 100}%`;
        gaugeFill.style.backgroundColor = '#ef4444';
        resultHeart.classList.add('text-red-500');
        resultHeart.classList.remove('text-green-500');
    }
}
