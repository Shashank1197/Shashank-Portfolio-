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
    const container = document.getElementById("canvas-container");
    const canvas = document.getElementById("particle-canvas");
    if (!container || !canvas) return;

    // Create Scene, Camera, and WebGL Renderer
    const scene = new THREE.Scene();
    
    // Set up camera with dynamic aspect ratio
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 80;

    // Set up Renderer with antialiasing and alpha (transparent bg)
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    
    // Handle 4K/high-res screens perfectly using devicePixelRatio
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance, but extremely crisp
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Generate random particles
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Palette (Red: #ff003c, Crimson: #8b0000, Soft gray)
    const colorChoices = [
        new THREE.Color(0xff003c), // Glowing Red
        new THREE.Color(0x8b0000), // Crimson Red
        new THREE.Color(0x555555)  // Soft gray
    ];

    for (let i = 0; i < particleCount; i++) {
        // Distribute particles in a spherical layout
        const r = 50 + Math.random() * 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Assign colors randomly from the choices
        const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material with round soft particles
    // Create a 2D canvas texture for a round dot to avoid pixelated squares
    const createCircleTexture = () => {
        const matCanvas = document.createElement('canvas');
        matCanvas.width = 16;
        matCanvas.height = 16;
        const matCtx = matCanvas.getContext('2d');
        const gradient = matCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        matCtx.fillStyle = gradient;
        matCtx.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(matCanvas);
    };

    const material = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        map: createCircleTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // Create line connection topology (connect points within a threshold)
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xff003c,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    // Create connections statically
    const lineIndices = [];
    for (let i = 0; i < particleCount; i++) {
        let connections = 0;
        for (let j = i + 1; j < particleCount && connections < 2; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            // Connect close nodes
            if (dist < 28) {
                lineIndices.push(i, j);
                connections++;
            }
        }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineGeometry.setIndex(lineIndices);

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Mouse movement variables for parallax & interactive gravity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
        // Normalize mouse coordinates to [-1, 1]
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Scroll parallax zoom/rotate
    let scrollProgress = 0;
    window.addEventListener('scroll', () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0) {
            scrollProgress = window.scrollY / maxScroll;
        }
    });

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Slow auto-rotation (live animation)
        pointCloud.rotation.y = elapsedTime * 0.05;
        pointCloud.rotation.x = elapsedTime * 0.02;
        lines.rotation.y = elapsedTime * 0.05;
        lines.rotation.x = elapsedTime * 0.02;

        // Smoothly interpolate mouse target coordinates for interactive parallax drag
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        // Apply mouse interaction offset to rotation
        pointCloud.rotation.y += targetX * 0.25;
        pointCloud.rotation.x -= targetY * 0.25;
        lines.rotation.y += targetX * 0.25;
        lines.rotation.x -= targetY * 0.25;

        // Parallax depth movement
        camera.position.x = targetX * 15;
        camera.position.y = targetY * 15;
        
        // Scroll interaction - pull camera back or push forward dynamically
        camera.position.z = 80 + scrollProgress * 40;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

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
  about          - Details about Shashank's academic journey
  skills         - Lists developer stack & languages
  experience     - Internship & professional work history
  certifications - Professional credentials & certs
  awards         - TCS iON NQT test scores & accolades
  projects       - Displays highlights from my GitHub repositories
  hometown       - Information on Dhanbad, Jharkhand
  sbu            - About Sarala Birla University, Ranchi
  contact        - Info on how to connect directly
  socials        - Quick links to GitHub/LinkedIn profiles
  hack           - Execute mock kernel override bypass
  clear          - Flush terminal output buffer`,

        experience: () => `WORK HISTORY & INTERNSHIPS:
---------------------------
1. Summer Research Intern (June 2025 - July 2025)
   BIT Sindri (Sindri, India) - On-site
   Role: Designed core algorithms, optimized structural data flows in C/C++, Java, and Python.
   
2. Full Stack Web Developer Intern (March 2024 - May 2024)
   Solar Secure IT Solutions - Remote
   Role: Built frontend and backend components with PHP, MySQL, CSS, and JS across full request cycle.`,

        certifications: () => `LICENSES & CERTIFICATIONS:
---------------------------
- Oracle Agentic AI Certified Foundations Associate (Aug 2026)
  Cred ID: 103505350AAI26OFA (LangChain, AI Agents, OCI)
- HackerRank SQL Basic Certificate (Aug 2026)
  Cred ID: 88CA9D53BAC9
- HackerRank Software Engineer Intern (Jul 2026)
  Cred ID: 3COB9A0A232F
- Simplilearn Databricks SQL Analytics & BI (Jan 2026)
  Cred ID: 9714749
- Career Essentials in Generative AI - Microsoft & LinkedIn (Nov 2025)
- GUVI / IIT Madras Research Park Python Programming (Jul 2023)
  Cred ID: 61654bHAF8255R19D6
- AWS Solutions Architecture Job Simulation (2023)
- Goldman Sachs Software Engineering Job Simulation (2023)
- The Achievement C Programming Course (Grade B+, Jan 2023)`,

        certs: () => commands.certifications(),

        awards: () => `HONORS, AWARDS & TEST SCORES:
------------------------------
- Code N Clone Winner (Code Byte, Aug 2024)
  1st place winner at Sarala Birla University. Designed and debugged SBU site clone.
  
- TCS iON NQT IT Score (June 2026)
  Cognitive: 80.51% | Programming: 68.17% | Quantitative: 64.84%
  Total NQT Score: 80.51% (Verified Certificate)`,
        
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
1. Recipe Finder [Live]    - Low-RAM recipe pairing engine (FastAPI).
2. Cyber Arena [Live]     - Cybersecurity simulation arena (Python/JS).
3. AI Meeting Assistant   - Whisper transcribing, summarizer, & RAG API.
4. Face-Recognition Log   - Deep learning computer vision log panel.
5. B2B Outreach Engine    - Web crawler & cold-email automation scheduler.
6. Offline Assistant      - Local Voice agent powered by Ollama models.
7. eVcharge Station Find  - Mapping portal with slot booking mockups.
8. Hand Gesture Control   - MediaPipe gesture interfaces for desktop controls.
9. Virtual Police Portal  - Citizen FIR log EJS/Node.js web application.
10. Collector Hub         - TypeScript data streams dashboard panel.
11. Automated Cleaner     - Data parsing utility for financial ledgers.`,

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
        { text: "Bypassing Sarala Birla University server firewall...", color: "#ff4d4d" },
        { text: "Establishing secure proxy node redirect tunnels...", color: "#ff4d4d" },
        { text: "Tunnel: Ranchi -> Dhanbad -> localhost:3306", color: "#ff003c" },
        { text: "Intercepting database credentials for user 'admin'...", color: "#ff003c" },
        { text: "Cracking cryptographic salt using locally deployed LLM agent...", color: "#8b0000" },
        { text: "Decoding SHA-256 secure hashes: [||||||||||||||||||||] 100%", color: "#ff003c" },
        { text: "DECRYPTION SUCCESSFUL. Access token: SBU_CSE_2024_SHASHANK", color: "#ff003c" },
        { text: "ROOT ACCESS GRANTED. Welcome, Shashank Kumar.", color: "#ff003c" }
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
