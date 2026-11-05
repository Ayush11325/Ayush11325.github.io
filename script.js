(function () {
  /* ---------- Sound (Web Audio, no files needed) ---------- */
  var ctx = null,
    soundOn = false;
  var soundBtn = document.getElementById("soundBtn");

  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function beep(freq, dur, type, vol) {
    if (!soundOn) return;
    var a = audio(),
      o = a.createOscillator(),
      g = a.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq * 1.6, a.currentTime + dur);
    g.gain.setValueAtTime(vol || 0.05, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + dur);
  }

  window.akSfx = {
    click: function () {
      beep(660, 0.09, "square", 0.03);
    },
    open: function () {
      beep(440, 0.18, "sine", 0.05);
    },
    send: function () {
      beep(880, 0.07, "triangle", 0.04);
    },
    reply: function () {
      beep(990, 0.12, "sine", 0.03);
    },
  };

  soundBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    soundBtn.setAttribute("aria-pressed", soundOn);
    soundBtn.textContent = soundOn ? "♫" : "♪";
    audio();
    if (soundOn) window.akSfx.open();
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("a,button")) window.akSfx.click();
  });

  /* ---------- Boot loader ---------- */
  var logs = [
    "> init neural core ........ OK",
    "> loading profile data ... OK",
    "> calibrating 3D renderer ... OK",
    "> system ready",
  ];
  var log = document.getElementById("bootLog"),
    bar = document.getElementById("bootBar");
  var li = 0;
  var bt = setInterval(function () {
    log.textContent += (li ? "\n" : "") + logs[li];
    bar.style.width = ((li + 1) / logs.length) * 100 + "%";
    li++;
    if (li === logs.length) {
      clearInterval(bt);
      setTimeout(function () {
        document.getElementById("boot").classList.add("done");
      }, 350);
    }
  }, 420);

  /* ---------- Typing role ---------- */
  var words = [
    "Software Engineer",
    "AI & ML Student",
    "Python Developer",
    "Computer Vision Builder",
  ];
  var typed = document.getElementById("typed"),
    w = 0,
    c = 0,
    del = false;
  (function tick() {
    var word = words[w],
      delay = 90;
    typed.textContent = word.slice(0, c);
    if (!del && c < word.length) c++;
    else if (!del) {
      del = true;
      delay = 1400;
    } else if (c > 0) {
      c--;
      delay = 40;
    } else {
      del = false;
      w = (w + 1) % words.length;
      delay = 300;
    }
    setTimeout(tick, delay);
  })();

  /* ---------- 3D robot head (Three.js) ---------- */
  var wrap = document.getElementById("scene");
  if (window.THREE && wrap) {
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    wrap.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 7;

    var shell = new THREE.MeshStandardMaterial({
      color: 0x0b1d2e,
      metalness: 0.7,
      roughness: 0.25,
    });
    var robot = new THREE.Group();

    var head = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.8, 1.7), shell);
    head.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(head.geometry),
        new THREE.LineBasicMaterial({ color: 0x00f0ff }),
      ),
    );
    robot.add(head);

    var glow = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    var eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.05), glow);
    eyeL.position.set(-0.55, 0.2, 0.87);
    var eyeR = eyeL.clone();
    eyeR.position.x = 0.55;
    robot.add(eyeL, eyeR);

    var mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.07, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xff3d7f }),
    );
    mouth.position.set(0, -0.45, 0.87);
    robot.add(mouth);

    var stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.6),
      shell,
    );
    stick.position.y = 1.2;
    robot.add(stick);
    var tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff3d7f }),
    );
    tip.position.y = 1.55;
    robot.add(tip);

    var ear1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.4), shell);
    ear1.position.set(-1.2, 0, 0);
    var ear2 = ear1.clone();
    ear2.position.x = 1.2;
    robot.add(ear1, ear2);
    scene.add(robot);

    var ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(3, 0.012, 8, 140),
      new THREE.MeshBasicMaterial({ color: 0x8b5cf6 }),
    );
    ring1.rotation.x = Math.PI / 2.4;
    var ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.01, 8, 140),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff }),
    );
    ring2.rotation.y = Math.PI / 3;
    scene.add(ring1, ring2);

    var core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.8, 1),
      new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      }),
    );
    scene.add(core);

    var n = 350,
      pos = new Float32Array(n * 3);
    for (var k = 0; k < n * 3; k++) pos[k] = (Math.random() - 0.5) * 16;
    var pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var pts = new THREE.Points(
      pg,
      new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.035,
        transparent: true,
        opacity: 0.7,
      }),
    );
    scene.add(pts);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    var key = new THREE.DirectionalLight(0x00f0ff, 1.3);
    key.position.set(3, 4, 5);
    scene.add(key);
    var fill = new THREE.PointLight(0x8b5cf6, 1.6, 25);
    fill.position.set(-4, -2, 4);
    scene.add(fill);

    function resize() {
      var w = wrap.clientWidth,
        h = wrap.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    var mx = 0,
      my = 0;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    });

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var visible = true;
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
    }).observe(wrap);

    function animate(t) {
      requestAnimationFrame(animate);
      if (!visible) return;
      robot.rotation.y +=
        (Math.sin(t * 0.0006) * 0.35 + mx * 0.6 - robot.rotation.y) * 0.08;
      robot.rotation.x += (my * 0.25 - robot.rotation.x) * 0.08;
      robot.position.y = Math.sin(t * 0.0015) * 0.12;
      var blink = t % 4000 < 120 ? 0.15 : 1;
      eyeL.scale.y = eyeR.scale.y = blink;
      ring1.rotation.z += 0.004;
      ring2.rotation.x += 0.002;
      core.rotation.y += 0.0015;
      core.rotation.x += 0.0008;
      pts.rotation.y += 0.0005;
      renderer.render(scene, camera);
    }
    if (reduce) renderer.render(scene, camera);
    else requestAnimationFrame(animate);
  }

  /* ---------- Reveal on scroll ---------- */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach(function (el) {
    io.observe(el);
  });

  /* ---------- 3D tilt on project cards and cursor trail (desktop) ---------- */
  if (window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "rotateY(" + x * 12 + "deg) rotateX(" + -y * 12 + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });

    var last = 0;
    document.addEventListener("mousemove", function (e) {
      var now = Date.now();
      if (now - last < 40) return;
      last = now;
      var d = document.createElement("div");
      d.className = "trail";
      d.style.left = e.clientX + "px";
      d.style.top = e.clientY + "px";
      document.body.appendChild(d);
      setTimeout(function () {
        d.remove();
      }, 600);
    });
  }

  /* ---------- Copy email ---------- */
  document.getElementById("copy").addEventListener("click", function () {
    var btn = this,
      email = document.getElementById("em").textContent.trim();
    function done() {
      btn.textContent = "COPIED ✓";
      setTimeout(function () {
        btn.textContent = "COPY EMAIL";
      }, 1800);
    }
    function fallback() {
      location.href = "mailto:" + email;
    }
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(email).then(done, fallback);
    else fallback();
  });

  /* ---------- AK-BOT chatbot (answers from resume data) ---------- */
  var KB = [
    {
      keys: ["hi", "hello", "hey", "namaste", "hii"],
      reply:
        "Hi! Main AK-BOT hoon. Ayush Kumar ke baare mein skills, projects, experience, education, certifications ya contact ke baare mein poochein.",
    },
    {
      keys: ["who", "about", "yourself", "kaun", "introduce", "kon"],
      reply:
        "Ayush Kumar ek Software Engineer hain aur MCA (AI & ML) ke student hain, LNCT University, Bhopal se. Woh Python, OpenCV, Flask aur MySQL par kaam karte hain.",
    },
    { keys: ["name", "naam"], reply: "Mera naam Ayush Kumar hai." },
    {
      keys: [
        "education",
        "study",
        "college",
        "university",
        "degree",
        "padhai",
        "cgpa",
        "gpa",
        "mca",
        "bca",
      ],
      reply:
        "MCA in AI & ML, LNCT University (2027 mein graduate hoga), CGPA 8.3/10.\nBCA, LNCT University (2022 to 2025), CGPA 7.8/10.",
    },
    {
      keys: [
        "skill",
        "skills",
        "tech",
        "stack",
        "language",
        "languages",
        "kya aata",
      ],
      reply:
        "Languages: Python, Java, C, C++, SQL, HTML, CSS.\nFrameworks: Django, Flask, OpenCV, Tkinter, MySQL Connector, OpenPyXL.\nCore: OOP, DSA, Relational DBMS, REST APIs, Agile, SDLC.\nTools: MySQL, Git, GitHub, VS Code, IntelliJ IDEA, Excel, Linux.",
    },
    {
      keys: ["python"],
      reply:
        "Python Ayush ki sabse zyada use hone wali language hai. Attendance system, library app aur Flask dispatcher teeno Python mein bane hain.",
    },
    {
      keys: ["opencv", "computer vision", "face", "vision", "camera"],
      reply:
        "Face Recognition Attendance System mein OpenCV ke Haar cascades se live video mein faces detect karke classroom attendance lagti hai, aur records MySQL mein save hote hain.",
    },
    {
      keys: ["project", "projects", "built", "work", "banaya", "kaam"],
      reply:
        "Teen projects:\n1. Face Recognition Attendance System (Python, OpenCV, MySQL)\n2. Library Management System (Python, Tkinter, MySQL)\n3. Automated File & Data Dispatcher (Python, Flask, OpenPyXL, MySQL)\nKis project ke baare mein detail chahiye?",
    },
    {
      keys: ["library", "tkinter", "crud"],
      reply:
        "Library Management System ek desktop app hai jo Tkinter se bana hai. Isme catalog ke liye full CRUD hai, aur MySQL mein normalized tables aur foreign keys hain jo duplicate records rokte hain.",
    },
    {
      keys: ["flask", "excel", "dispatcher", "report", "openpyxl"],
      reply:
        "File & Data Dispatcher ek Flask backend hai jo dynamic Excel sheets parse karke reports automatically banata hai. Isme error handling aur logging bhi hai batch processing ke liye.",
    },
    {
      keys: ["experience", "intern", "internship", "job", "company"],
      reply:
        "Experience:\n- Cisco-AICTE Virtual Internship (Aug 2026): Software and Network Engineering Intern. Python diagnostic scripts aur Cisco Packet Tracer par IP routing.\n- ServiceNow, AICTE & SmartBridge (May 2026): Software Platform Intern. Workflow automation aur Agile SDLC.\n- Deloitte Australia (Jun 2025): Technology Job Simulation. Dashboard concepts aur BI specifications.",
    },
    {
      keys: ["network", "cisco", "routing", "packet"],
      reply:
        "Cisco-AICTE internship mein Ayush ne Python scripts likhi jo packet routing paths check karti hain aur latency bottlenecks dhoondhti hain. Enterprise topologies Cisco Packet Tracer mein simulate ki.",
    },
    {
      keys: [
        "certificate",
        "certification",
        "certified",
        "aws",
        "cloud",
        "hackerrank",
        "badge",
        "award",
        "achievement",
        "hackathon",
        "win",
        "prize",
      ],
      reply:
        "Certifications: AWS Academy Graduate (Cloud Architecture, Cloud Development, Generative AI, 2026), HackerRank Software Engineer role certificate (2026), Advanced DBMS (2025), Cisco Cybersecurity Essentials.\nAchievements: 3rd place, Samatrix.io Future Coders Hackathon. HackerRank 5-star badges in Python, Java, C++, MySQL.",
    },
    {
      keys: [
        "contact",
        "email",
        "mail",
        "reach",
        "number",
        "linkedin",
        "github",
        "hire",
      ],
      reply:
        "Email: ayush.lnct11325@gmail.com\nGitHub: https://github.com/Ayush11325\nLinkedIn: https://www.linkedin.com/in/ayush11325/",
    },
    {
      keys: ["location", "where", "city", "bhopal", "live", "kahan"],
      reply: "Ayush Bhopal, Madhya Pradesh, India mein rehte hain.",
    },
    {
      keys: ["available", "open", "looking"],
      reply:
        "Ayush internships aur entry-level software roles ke liye open hain. Email: ayush.lnct11325@gmail.com",
    },
    {
      keys: ["thanks", "thank", "thx", "shukriya", "dhanyawad"],
      reply: "Shukriya! Aur kuch poochna ho to bataiye.",
    },
    {
      keys: ["bye", "goodbye", "alvida"],
      reply: "Bye! Jab chahein wapas aayein.",
    },
  ];
  var DEFAULT =
    "Iska jawab mere paas nahi hai. Aap skills, projects, experience, education, certifications ya contact ke baare mein pooch sakte hain.";

  function answer(q) {
    var t = q.toLowerCase(),
      best = null,
      score = 0;
    KB.forEach(function (item) {
      var s = 0;
      item.keys.forEach(function (k) {
        if (t.indexOf(k) !== -1) s += k.length;
      });
      if (s > score) {
        score = s;
        best = item;
      }
    });
    return best ? best.reply : DEFAULT;
  }

  var fab = document.getElementById("botFab"),
    bot = document.getElementById("bot");
  var msgs = document.getElementById("botMsgs"),
    form = document.getElementById("botForm");
  var input = document.getElementById("botIn"),
    chips = document.getElementById("botChips");
  var greeted = false;

  function add(text, who) {
    var d = document.createElement("div");
    d.className = "msg " + (who === "user" ? "user-m" : "bot-m");
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function botSay(text) {
    var t = document.createElement("div");
    t.className = "typing";
    t.textContent = "AK-BOT is typing...";
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(function () {
      t.remove();
      add(text, "bot");
      window.akSfx.reply();
    }, 450);
  }

  function open() {
    bot.hidden = false;
    window.akSfx.open();
    if (!greeted) {
      greeted = true;
      botSay(
        "Hi, main AK-BOT hoon. Ayush Kumar ke baare mein kuch bhi poochein.",
      );
    }
    setTimeout(function () {
      input.focus();
    }, 50);
  }

  function close() {
    bot.hidden = true;
  }

  fab.addEventListener("click", function () {
    bot.hidden ? open() : close();
  });
  document.getElementById("botClose").addEventListener("click", close);
  document.getElementById("openChat").addEventListener("click", open);
  document.getElementById("openChat2").addEventListener("click", open);

  ["Skills", "Projects", "Experience", "Education", "Contact"].forEach(
    function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = q;
      b.addEventListener("click", function () {
        send(q);
      });
      chips.appendChild(b);
    },
  );

  function send(text) {
    text = (text || "").trim();
    if (!text) return;
    add(text, "user");
    window.akSfx.send();
    input.value = "";
    botSay(answer(text));
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    send(input.value);
  });
})();
