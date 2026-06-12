// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    initCanvasParticles();
    initHeaderScroll();
    initProjectFilters();
    initAITerminal();
    initContactForm();
    initScrollAnimations();
    initMobileMenu();
});

/* =========================================================================
   1. Optimized Canvas Particles Background
   ========================================================================= */
function initCanvasParticles() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrameId;

    // Colors matching CSS theme (cyan and purple accents)
    const particleColors = [
        "rgba(0, 242, 254, 0.25)",  // Cyan
        "rgba(155, 81, 224, 0.2)",   // Purple
        "rgba(255, 255, 255, 0.08)"  // Soft white
    ];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce off boundaries or wrap around
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function setupParticles() {
        particles = [];
        // Scale particle count with screen size
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 80);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Add soft connections between close particles
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dist = Math.hypot(particles[a].x - particles[b].x, particles[a].y - particles[b].y);
                if (dist < 120) {
                    ctx.strokeStyle = `rgba(0, 242, 254, ${0.12 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", () => {
        resizeCanvas();
        setupParticles();
    });

    // Run setup
    resizeCanvas();
    setupParticles();
    animate();
}

/* =========================================================================
   2. Sticky Header Scroll Effect
   ========================================================================= */
function initHeaderScroll() {
    const header = document.getElementById("main-header");
    const navLinks = document.querySelectorAll(".nav-links a");
    const sections = document.querySelectorAll("section");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

        // Active link on scroll high-lighting
        let currentSectionId = "";
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            const height = sec.offsetHeight;
            if (window.scrollY >= top && window.scrollY < top + height) {
                currentSectionId = sec.getAttribute("id");
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${currentSectionId}`) {
                    link.classList.add("active");
                }
            });
        }
    });
}

/* =========================================================================
   3. Dynamic Projects Filter
   ========================================================================= */
function initProjectFilters() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class from all
            filterButtons.forEach(b => b.classList.remove("active"));
            // Add to clicked
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            projectCards.forEach(card => {
                const category = card.getAttribute("data-category");
                
                // Hide with transition
                if (filterValue === "all" || category === filterValue) {
                    card.style.display = "flex";
                    // Brief delay to allow transitions to work
                    setTimeout(() => {
                        card.style.opacity = "1";
                        card.style.transform = "scale(1)";
                    }, 50);
                } else {
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.92)";
                    // Set display none after opacity animation completes
                    setTimeout(() => {
                        card.style.display = "none";
                    }, 300);
                }
            });
        });
    });
}

/* =========================================================================
   4. Simulated AI Developer Terminal Emulator
   ========================================================================= */
function initAITerminal() {
    const termInput = document.getElementById("terminal-cmd-input");
    const termBody = document.getElementById("terminal-output-body");
    const promptLine = document.getElementById("prompt-line");
    
    if (!termInput || !termBody) return;

    // Focus terminal when clicking inside the window
    document.getElementById("ai-terminal-window").addEventListener("click", () => {
        termInput.focus();
    });

    // Command History tracking
    let commandHistory = [];
    let historyIdx = -1;

    // Terminal command definitions
    const commands = {
        help: () => `Available commands:
  about    - Details about Shashank's academic journey
  skills   - Lists developer stack & languages
  projects - Displays highlights from my 20 repositories
  hometown - Information on Dhanbad, Jharkhand
  sbu      - About Sarala Birla University, Ranchi
  contact  - Info on how to connect directly
  socials  - Quick links to GitHub/LinkedIn profiles
  hack     - Execute mock kernel override bypass
  clear    - Flush terminal output buffer`,
        
        about: () => `Shashank Kumar
--------------
B.Tech Computer Science & Engineering Graduate (2022-2026 Batch) from Sarala Birla University. 
Passionate developer interested in building robust, local-first artificial intelligence agents, NLP voice modules, computer vision systems, and modern web backends.
Main focuses: offline AI systems, speech APIs, scraping automation.`,
        
        skills: () => `SKILLS STACK SUMMARY
====================
[Languages]      : Python, JavaScript, PHP, SQL
[AI & Vision]    : OpenCV, MediaPipe, Whisper ASR, RAG, local LLMs (Ollama)
[Web Backend]    : FastAPI, Node.js / Express, PHP
[Tools & Dev]    : Git/GitHub, Docker, CI/CD, MySQL, MongoDB`,
        
        projects: () => `HIGHLIGHT PROJECTS:
-------------------
1. AI Meeting Assistant   - Whisper transcribing, summarizer, & RAG API.
2. Face-Recognition Log   - Deep learning computer vision log panel.
3. B2B Outreach Engine    - Web crawler & cold-email automation scheduler.
4. Offline Assistant      - Local Voice agent powered by Ollama models.
5. eVcharge Station Find  - Mapping portal with slot booking mockups.
6. Hand Gesture Control   - MediaPipe gesture interfaces for desktop controls.
7. Virtual Police Portal  - Citizen FIR log EJS/Node.js web application.`,

        hometown: () => `Hometown: Dhanbad, Jharkhand
---------------------------
Dhanbad is widely known as the "Coal Capital of India" due to its rich reserves. 
It is one of the most populated and industrial areas in Jharkhand, home to premier institutions like IIT (ISM) Dhanbad.`,

        sbu: () => `Sarala Birla University (SBU), Ranchi
---------------------------------------
SBU is a private university located in the capital city of Jharkhand, Ranchi.
It focuses on research-driven education in engineering, management, and design fields. 
Shashank graduated with a Bachelor of Technology in Computer Science & Engineering here (2022-2026 Batch).`,

        contact: () => `CONNECT DIRECTLY:
-----------------
Fill out the contact form below on the webpage!
Email: shashankkumar1197@gmail.com
Phone: +91 6202556466`,

        socials: () => `SOCIAL REACH:
-------------
GitHub    : https://github.com/Shashank1197
LinkedIn  : https://www.linkedin.com/in/shashank-kumar-07b4aa256/
Instagram : https://www.instagram.com/shashank_kumar_97/`,

        date: () => new Date().toString(),
        
        clear: () => {
            // Handle clearing inside event
            return "__CLEAR__";
        },

        hack: () => {
            return "__HACK__";
        }
    };

    termInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const rawInput = termInput.value;
            const inputClean = rawInput.trim().toLowerCase();
            
            if (inputClean) {
                commandHistory.push(rawInput);
                historyIdx = commandHistory.length;
            }

            // Print user command line
            const userLine = document.createElement("div");
            userLine.className = "terminal-line";
            userLine.innerHTML = `<span class="terminal-prompt">guest@shashank-sbu:~$</span> <span style="color:#ffffff;">${rawInput}</span>`;
            termBody.insertBefore(userLine, promptLine);

            termInput.value = "";

            if (inputClean) {
                if (commands[inputClean]) {
                    const output = commands[inputClean]();
                    
                    if (output === "__CLEAR__") {
                        // Clear lines except initial initialization lines
                        const lines = termBody.querySelectorAll(".terminal-line:not(#prompt-line)");
                        lines.forEach(l => l.remove());
                    } else if (output === "__HACK__") {
                        executeHackSimulation(termBody, promptLine);
                    } else {
                        // Regular output
                        const outDiv = document.createElement("div");
                        outDiv.className = "terminal-line";
                        outDiv.innerHTML = `<span class="terminal-output">${output.replace(/\n/g, "<br>")}</span>`;
                        termBody.insertBefore(outDiv, promptLine);
                    }
                } else {
                    // Command not found
                    const errorDiv = document.createElement("div");
                    errorDiv.className = "terminal-line";
                    errorDiv.innerHTML = `<span class="terminal-output" style="color:#ff5f56;">Command not found: '${rawInput}'. Type 'help' for support.</span>`;
                    termBody.insertBefore(errorDiv, promptLine);
                }
            }

            // Scroll terminal to bottom
            termBody.scrollTop = termBody.scrollHeight;
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (historyIdx > 0) {
                historyIdx--;
                termInput.value = commandHistory[historyIdx];
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIdx < commandHistory.length - 1) {
                historyIdx++;
                termInput.value = commandHistory[historyIdx];
            } else {
                historyIdx = commandHistory.length;
                termInput.value = "";
            }
        }
    });
}

function executeHackSimulation(termBody, promptLine) {
    const hackSteps = [
        { text: "Bypassing Sarala Birla University server firewall...", color: "#ffbd2e" },
        { text: "Establishing secure proxy node redirect tunnels...", color: "#ffbd2e" },
        { text: "Tunnel: Ranchi -> Dhanbad -> localhost:3306", color: "#00f2fe" },
        { text: "Intercepting database credentials for user 'admin'...", color: "#00f2fe" },
        { text: "Cracking cryptographic salt using locally deployed LLM agent...", color: "#9b51e0" },
        { text: "Decoding SHA-256 secure hashes: [||||||||||||||||||||] 100%", color: "#27c93f" },
        { text: "DECRYPTION SUCCESSFUL. Access token: SBU_CSE_2024_SHASHANK", color: "#27c93f" },
        { text: "ROOT ACCESS GRANTED. Welcome, Shashank Kumar.", color: "#27c93f" }
    ];

    let delay = 0;
    hackSteps.forEach(step => {
        setTimeout(() => {
            const stepDiv = document.createElement("div");
            stepDiv.className = "terminal-line";
            stepDiv.innerHTML = `<span class="terminal-output" style="color:${step.color};">${step.text}</span>`;
            termBody.insertBefore(stepDiv, promptLine);
            termBody.scrollTop = termBody.scrollHeight;
        }, delay);
        delay += 600;
    });
}

/* =========================================================================
   5. Interactive Contact Form Handler & Toast Notification
   ========================================================================= */
function initContactForm() {
    const form = document.getElementById("portfolio-contact-form");
    const toast = document.getElementById("toast-notification");
    const toastMsg = document.getElementById("toast-message");
    const submitBtn = document.getElementById("form-submit-btn");

    if (!form || !toast) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("contact-name").value;
        const email = document.getElementById("contact-email").value;
        const message = document.getElementById("contact-message").value;

        // Visual button load effect
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `Sending... <i class="fa-solid fa-spinner fa-spin"></i>`;
        submitBtn.disabled = true;

        // =========================================================================
        // WEB3FORMS ACCESS KEY CONFIGURATION
        // Go to https://web3forms.com to get your free access key (sent to your email).
        // Paste your key below to receive contact messages in shashankkumar1197@gmail.com
        // =========================================================================
        const accessKey = "be550e38-5e72-46ea-8a2f-1454bce0c7aa"; 

        if (accessKey === "YOUR_WEB3FORMS_ACCESS_KEY" || !accessKey) {
            // Fallback warning when access key isn't pasted yet
            setTimeout(() => {
                form.reset();
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.disabled = false;
                toastMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Mock sent! Enter your Web3Forms Access Key in script.js.`;
                toast.style.borderColor = "#ffbd2e";
                toast.classList.add("show");
                setTimeout(() => {
                    toast.classList.remove("show");
                }, 5000);
            }, 1200);
            return;
        }

        const formData = {
            access_key: accessKey,
            name: name,
            email: email,
            message: message,
            subject: "New message from " + name + " (Developer Portfolio)"
        };

        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(async (response) => {
            let json = await response.json();
            if (response.status === 200) {
                form.reset();
                toastMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> Message sent successfully! I'll contact you soon.`;
                toast.style.borderColor = "var(--primary)";
            } else {
                console.error(json);
                toastMsg.innerHTML = `<i class="fa-solid fa-circle-xmark" style="color:#ff5f56;"></i> Error: ` + json.message;
                toast.style.borderColor = "#ff5f56";
            }
        })
        .catch(error => {
            console.error(error);
            toastMsg.innerHTML = `<i class="fa-solid fa-circle-xmark" style="color:#ff5f56;"></i> Network error. Please try again.`;
            toast.style.borderColor = "#ff5f56";
        })
        .then(() => {
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
            }, 5000);
        });
    });
}

/* =========================================================================
   6. Scroll Reveal Animations (Intersection Observer)
   ========================================================================= */
function initScrollAnimations() {
    const animateElements = document.querySelectorAll(".animate-on-scroll");

    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.12 // Element is animated when 12% is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animated");
                // Stop observing once animated to avoid repeated triggers
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => {
        observer.observe(el);
    });
}

/* =========================================================================
   7. Mobile Navigation Toggle Menu
   ========================================================================= */
function initMobileMenu() {
    const toggleBtn = document.getElementById("mobile-toggle");
    const navList = document.getElementById("navigation-list");

    if (!toggleBtn || !navList) return;

    toggleBtn.addEventListener("click", () => {
        // Toggle slide navigation dropdown
        if (navList.style.display === "flex") {
            navList.style.display = "none";
            toggleBtn.innerHTML = `<i class="fa-solid fa-bars-staggered"></i>`;
        } else {
            navList.style.display = "flex";
            navList.style.flexDirection = "column";
            navList.style.position = "absolute";
            navList.style.top = "80px";
            navList.style.left = "0";
            navList.style.width = "100%";
            navList.style.background = "rgba(7, 9, 19, 0.96)";
            navList.style.backdropFilter = "blur(15px)";
            navList.style.padding = "2rem";
            navList.style.gap = "1.5rem";
            navList.style.borderBottom = "1px solid var(--border-color)";
            
            toggleBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
        }
    });

    // Close menu when clicking nav link
    const navLinks = navList.querySelectorAll("a");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                navList.style.display = "none";
                toggleBtn.innerHTML = `<i class="fa-solid fa-bars-staggered"></i>`;
            }
        });
    });
}
