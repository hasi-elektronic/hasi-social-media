const SESSION_COOKIE = "hasi_cockpit_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const LOGIN_HTML = "<!doctype html>\n<html lang=\"de\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Hasi Social Media Login</title>\n    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />\n    <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Nunito+Sans:wght@400;500;600;700;800&display=swap\" rel=\"stylesheet\" />\n    <style>\n      :root {\n        --blue: #3abadf;\n        --ink: #0d1b2a;\n        --muted: #667085;\n        --line: #d8eef5;\n        --orange: #ff6b00;\n      }\n      * { box-sizing: border-box; }\n      body {\n        min-height: 100vh;\n        margin: 0;\n        display: grid;\n        place-items: center;\n        padding: 24px;\n        font-family: \"Nunito Sans\", system-ui, sans-serif;\n        color: var(--ink);\n        background:\n          radial-gradient(circle at 78% 20%, rgba(58, 186, 223, .24), transparent 28%),\n          linear-gradient(145deg, #081522 0%, #0d1b2a 45%, #1a5f75 100%);\n      }\n      h1, h2, h3, .brand strong {\n        font-family: \"Plus Jakarta Sans\", \"Nunito Sans\", system-ui, sans-serif;\n      }\n      .shell {\n        width: min(980px, 100%);\n        display: grid;\n        grid-template-columns: 1.1fr .9fr;\n        overflow: hidden;\n        border-radius: 12px;\n        background: #fff;\n        box-shadow: 0 30px 90px rgba(0, 0, 0, .36);\n      }\n      .intro {\n        padding: 42px;\n        color: #fff;\n        background:\n          radial-gradient(circle at 88% 86%, rgba(255,255,255,.17), transparent 30%),\n          linear-gradient(155deg, #0d1b2a, #3abadf);\n      }\n      .brand {\n        display: flex;\n        align-items: center;\n        gap: 14px;\n        margin-bottom: 54px;\n      }\n      .logo {\n        width: 64px;\n        height: 64px;\n        border-radius: 14px;\n        background: #fff;\n        padding: 9px;\n        object-fit: contain;\n      }\n      h1 {\n        margin: 0;\n        font-size: 42px;\n        line-height: 1;\n        letter-spacing: 0;\n      }\n      .intro p {\n        max-width: 460px;\n        color: rgba(255,255,255,.82);\n        font-size: 17px;\n        line-height: 1.45;\n      }\n      .chips {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 9px;\n        margin-top: 28px;\n      }\n      .chip {\n        padding: 8px 11px;\n        border-radius: 999px;\n        background: rgba(255,255,255,.13);\n        border: 1px solid rgba(255,255,255,.18);\n        font-size: 12px;\n        font-weight: 800;\n      }\n      .login {\n        padding: 42px;\n      }\n      .login h2 {\n        margin: 0 0 8px;\n        font-size: 28px;\n      }\n      .login p {\n        margin: 0 0 26px;\n        color: var(--muted);\n        line-height: 1.45;\n      }\n      label {\n        display: block;\n        margin: 16px 0 7px;\n        color: #344054;\n        font-size: 13px;\n        font-weight: 800;\n      }\n      input {\n        width: 100%;\n        height: 48px;\n        border: 1px solid var(--line);\n        border-radius: 8px;\n        padding: 0 13px;\n        font: inherit;\n        outline: none;\n      }\n      input:focus {\n        border-color: var(--blue);\n        box-shadow: 0 0 0 4px rgba(58, 186, 223, .14);\n      }\n      button {\n        width: 100%;\n        height: 50px;\n        margin-top: 22px;\n        border: 0;\n        border-radius: 8px;\n        background: var(--orange);\n        color: #fff;\n        font: inherit;\n        font-weight: 900;\n        cursor: pointer;\n      }\n      .error {\n        min-height: 20px;\n        margin-top: 14px;\n        color: #b42318;\n        font-size: 13px;\n        font-weight: 700;\n      }\n      .small {\n        margin-top: 24px;\n        color: var(--muted);\n        font-size: 12px;\n      }\n      @media (max-width: 820px) {\n        .shell { grid-template-columns: 1fr; }\n        .intro, .login { padding: 28px; }\n      }\n    </style>\n  </head>\n  <body>\n    <main class=\"shell\">\n      <section class=\"intro\">\n        <div class=\"brand\">\n          <img class=\"logo\" src=\"/hasi-logo.png\" alt=\"Hasi Elektronic\" />\n          <div>\n            <strong>Hasi Elektronic</strong><br />\n            <span>Hasi Social Media</span>\n          </div>\n        </div>\n        <h1>Hasi Social<br />Media</h1>\n        <p>Beiträge, Storys und Reels planen, prüfen und freigeben.</p>\n        <div class=\"chips\">\n          <span class=\"chip\">Web-App</span>\n          <span class=\"chip\">iOS</span>\n          <span class=\"chip\">Android</span>\n          <span class=\"chip\">Automatisierung</span>\n        </div>\n      </section>\n      <section class=\"login\">\n        <h2>Anmelden</h2>\n        <p>Bitte mit dem Hasi Zugang anmelden, bevor die Social-Media-Zentrale geöffnet wird.</p>\n        <form id=\"loginForm\">\n          <label for=\"email\">E-Mail</label>\n          <input id=\"email\" name=\"email\" type=\"email\" autocomplete=\"username\" required />\n          <label for=\"password\">Passwort</label>\n          <input id=\"password\" name=\"password\" type=\"password\" autocomplete=\"current-password\" required />\n          <button type=\"submit\">Hasi Social Media öffnen</button>\n          <div class=\"error\" id=\"error\"></div>\n        </form>\n        <div class=\"small\">Geschützter Bereich für Social-Media-Kunden.</div>\n      </section>\n    </main>\n    <script>\n      document.querySelector(\"#loginForm\").addEventListener(\"submit\", async (event) => {\n        event.preventDefault();\n        const error = document.querySelector(\"#error\");\n        error.textContent = \"\";\n        const body = {\n          email: document.querySelector(\"#email\").value,\n          password: document.querySelector(\"#password\").value,\n        };\n        const response = await fetch(\"/api/login\", {\n          method: \"POST\",\n          headers: { \"Content-Type\": \"application/json\" },\n          body: JSON.stringify(body),\n        });\n        if (response.ok) {\n          const next = new URLSearchParams(window.location.search).get(\"next\") || \"/app\";\n          window.location.href = next.startsWith(\"/\") ? next : \"/app\";\n          return;\n        }\n        error.textContent = \"Login fehlgeschlagen. Bitte Zugangsdaten prüfen.\";\n      });\n    </script>\n  </body>\n</html>\n";
const ADMIN_HTML = "<!doctype html>\n<html lang=\"de\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Hasi Social Media Admin</title>\n    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />\n    <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Nunito+Sans:wght@400;500;600;700;800&display=swap\" rel=\"stylesheet\" />\n    <style>\n      :root {\n        --blue: #3abadf;\n        --ink: #111827;\n        --muted: #667085;\n        --line: #d8eef5;\n        --bg: #f4f9fc;\n        --nav: #0d1b2a;\n        --orange: #ff6b00;\n        --green: #12b76a;\n        --red: #ef4444;\n      }\n      * { box-sizing: border-box; }\n      body {\n        margin: 0;\n        font-family: \"Nunito Sans\", system-ui, sans-serif;\n        color: var(--ink);\n        background: linear-gradient(180deg, rgba(58, 186, 223, .08), transparent 280px), var(--bg);\n      }\n      button, input, select, textarea { font: inherit; }\n      h1, h2, h3, h4, .brand b {\n        font-family: \"Plus Jakarta Sans\", \"Nunito Sans\", system-ui, sans-serif;\n      }\n      .layout { min-height: 100vh; display: grid; grid-template-columns: 280px 1fr; }\n      aside {\n        background: linear-gradient(180deg, var(--nav), #081522);\n        color: white;\n        padding: 26px 22px;\n        position: sticky;\n        top: 0;\n        height: 100vh;\n      }\n      .brand {\n        display: grid;\n        grid-template-columns: 56px 1fr;\n        align-items: center;\n        gap: 13px;\n        margin-bottom: 30px;\n        padding-bottom: 22px;\n        border-bottom: 1px solid rgba(216, 238, 245, .14);\n      }\n      .mark {\n        width: 56px;\n        height: 56px;\n        border-radius: 12px;\n        background: #fff;\n        display: grid;\n        place-items: center;\n        overflow: hidden;\n      }\n      .mark img { width: 42px; height: 42px; object-fit: contain; }\n      .brand strong { display: block; font-size: 16px; line-height: 1.15; }\n      .brand span { display: block; color: #a7dff0; font-size: 12px; margin-top: 4px; }\n      nav a {\n        display: flex;\n        align-items: center;\n        color: #cceefa;\n        text-decoration: none;\n        padding: 11px 12px;\n        border-radius: 8px;\n        margin-bottom: 6px;\n        font-size: 14px;\n      }\n      nav a.active, nav a:hover { background: rgba(58, 186, 223, .18); color: white; }\n      main { padding: 30px 28px 44px; max-width: 1320px; width: 100%; }\n      header {\n        display: flex;\n        justify-content: space-between;\n        gap: 20px;\n        align-items: flex-start;\n        margin-bottom: 22px;\n      }\n      .title-row { display: flex; align-items: center; gap: 14px; }\n      .header-logo {\n        width: 58px;\n        height: 58px;\n        border-radius: 12px;\n        background: white;\n        border: 1px solid var(--line);\n        padding: 8px;\n        object-fit: contain;\n      }\n      h1 { margin: 0; font-size: 34px; line-height: 1.05; letter-spacing: 0; }\n      h2 { margin: 0 0 12px; font-size: 20px; }\n      .subtitle { margin: 8px 0 0; color: var(--muted); }\n      .btn {\n        border: 0;\n        border-radius: 8px;\n        padding: 11px 14px;\n        background: var(--blue);\n        color: white;\n        font-weight: 800;\n        cursor: pointer;\n        text-decoration: none;\n        display: inline-flex;\n        align-items: center;\n      }\n      .btn.secondary { background: white; color: var(--ink); border: 1px solid var(--line); }\n      .btn.orange { background: var(--orange); }\n      .btn:disabled { opacity: .6; cursor: wait; }\n      .btn.small {\n        margin-top: 12px;\n        padding: 8px 10px;\n        font-size: 12px;\n      }\n      .grid { display: grid; gap: 16px; grid-template-columns: .95fr 1.05fr; align-items: start; }\n      .card {\n        background: #fff;\n        border: 1px solid var(--line);\n        border-radius: 8px;\n        padding: 18px;\n        box-shadow: 0 10px 26px rgba(26, 95, 117, .07);\n      }\n      .notice {\n        border-left: 4px solid var(--orange);\n        background: #fff7ed;\n        padding: 12px 14px;\n        border-radius: 8px;\n        color: #9a3412;\n        font-size: 14px;\n        margin-bottom: 14px;\n      }\n      .customer-list { display: grid; gap: 12px; }\n      .customer-card {\n        border: 1px solid #eef6f9;\n        border-radius: 8px;\n        padding: 14px;\n        background: #f8fcfe;\n      }\n      .customer-card h3 { margin: 0 0 7px; font-size: 17px; }\n      .customer-meta {\n        display: grid;\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n        gap: 7px 12px;\n        margin-top: 10px;\n      }\n      .pill {\n        display: inline-flex;\n        align-items: center;\n        border-radius: 999px;\n        padding: 5px 9px;\n        background: #eef9fc;\n        color: #17677f;\n        font-size: 12px;\n        font-weight: 800;\n      }\n      .pill.green { background: #ecfdf3; color: #067647; }\n      .pill.gray { background: #f2f4f7; color: #475467; }\n      .pill.orange { background: #fff7ed; color: #c2410c; }\n      .pill.red { background: #fef3f2; color: #b42318; }\n      .small { font-size: 12px; color: var(--muted); }\n      .checklist {\n        display: grid;\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n        gap: 7px 10px;\n        margin-top: 12px;\n      }\n      .check-item {\n        display: flex;\n        align-items: center;\n        gap: 7px;\n        color: var(--muted);\n        font-size: 12px;\n        font-weight: 700;\n      }\n      .check-dot {\n        width: 9px;\n        height: 9px;\n        border-radius: 999px;\n        background: var(--red);\n        flex: 0 0 auto;\n      }\n      .check-dot.ok { background: var(--green); }\n      .check-grid {\n        display: grid;\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n        gap: 9px 12px;\n      }\n      .check-label {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        margin: 0;\n        color: #344054;\n        font-size: 13px;\n        font-weight: 800;\n      }\n      .check-label input { width: auto; }\n      form {\n        display: grid;\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n        gap: 12px;\n      }\n      .field.full { grid-column: 1 / -1; }\n      label {\n        display: block;\n        margin-bottom: 6px;\n        color: #344054;\n        font-size: 12px;\n        font-weight: 800;\n      }\n      input, select, textarea {\n        width: 100%;\n        border: 1px solid var(--line);\n        border-radius: 8px;\n        padding: 10px 11px;\n        background: #fff;\n        color: var(--ink);\n        outline: none;\n      }\n      textarea { min-height: 92px; resize: vertical; }\n      input:focus, select:focus, textarea:focus {\n        border-color: var(--blue);\n        box-shadow: 0 0 0 4px rgba(58, 186, 223, .14);\n      }\n      .form-actions {\n        grid-column: 1 / -1;\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n      @media (max-width: 980px) {\n        .layout, .grid, form { grid-template-columns: 1fr; }\n        aside { position: relative; height: auto; }\n        header { flex-direction: column; }\n        .field.full { grid-column: auto; }\n      }\n    </style>\n  </head>\n  <body>\n    <div class=\"layout\">\n      <aside>\n        <div class=\"brand\">\n          <div class=\"mark\"><img src=\"/hasi-logo.png\" alt=\"Hasi Social Media\"></div>\n          <div>\n            <strong>Hasi Social Media</strong>\n            <span>Interne Verwaltung</span>\n          </div>\n        </div>\n        <nav>\n          <a class=\"active\" href=\"/admin\">Admin</a>\n          <a href=\"/logout\">Abmelden</a>\n        </nav>\n      </aside>\n      <main>\n        <header>\n          <div class=\"title-row\">\n            <img class=\"header-logo\" src=\"/hasi-logo.png\" alt=\"Hasi Social Media Logo\">\n            <div>\n              <h1>Hasi Social Media Admin</h1>\n              <p class=\"subtitle\">Kunden anlegen, Onboarding prüfen und Social-Media-Planung vorbereiten.</p>\n            </div>\n          </div>\n        </header>\n\n        <section class=\"grid\">\n          <div class=\"card\">\n            <h2>Kunden</h2>\n            <div class=\"notice\">Interne Verwaltung für alle Kunden. Hasi Elektronic ist hier nur ein Kunde in der Liste.</div>\n            <div class=\"customer-list\" id=\"customerList\">...</div>\n          </div>\n\n          <div class=\"card\">\n            <h2 id=\"formTitle\">Kunde anlegen</h2>\n            <form id=\"customerForm\">\n              <input id=\"customerId\" name=\"id\" type=\"hidden\">\n              <div class=\"field\">\n                <label for=\"company\">Firma *</label>\n                <input id=\"company\" name=\"company\" required placeholder=\"z.B. Muster GmbH\">\n              </div>\n              <div class=\"field\">\n                <label for=\"owner\">Ansprechpartner</label>\n                <input id=\"owner\" name=\"owner\" placeholder=\"Name\">\n              </div>\n              <div class=\"field\">\n                <label for=\"email\">E-Mail</label>\n                <input id=\"email\" name=\"email\" type=\"email\" placeholder=\"kontakt@firma.de\">\n              </div>\n              <div class=\"field\">\n                <label for=\"phone\">Telefon</label>\n                <input id=\"phone\" name=\"phone\" placeholder=\"0711 / ...\">\n              </div>\n              <div class=\"field\">\n                <label for=\"city\">Ort</label>\n                <input id=\"city\" name=\"city\" placeholder=\"Vaihingen/Enz\">\n              </div>\n              <div class=\"field\">\n                <label for=\"instagram\">Instagram</label>\n                <input id=\"instagram\" name=\"instagram\" placeholder=\"@kunde\">\n              </div>\n              <div class=\"field\">\n                <label for=\"industry\">Branche</label>\n                <input id=\"industry\" name=\"industry\" placeholder=\"Restaurant, Handwerk, Praxis ...\">\n              </div>\n              <div class=\"field\">\n                <label for=\"language\">Sprache</label>\n                <select id=\"language\" name=\"language\">\n                  <option value=\"de\">Deutsch</option>\n                  <option value=\"tr\">Türkisch</option>\n                  <option value=\"en\">Englisch</option>\n                </select>\n              </div>\n              <div class=\"field\">\n                <label for=\"primary\">Hauptfarbe</label>\n                <input id=\"primary\" name=\"primary\" value=\"#3ABADF\">\n              </div>\n              <div class=\"field\">\n                <label for=\"accent\">Akzentfarbe</label>\n                <input id=\"accent\" name=\"accent\" value=\"#FF6B00\">\n              </div>\n              <div class=\"field full\">\n                <label for=\"topics\">Themen</label>\n                <input id=\"topics\" name=\"topics\" placeholder=\"Angebote, Team, Tipps, Referenzen\">\n              </div>\n              <div class=\"field\">\n                <label for=\"carouselTime\">Karussell Zeit</label>\n                <input id=\"carouselTime\" name=\"carouselTime\" value=\"08:00\">\n              </div>\n              <div class=\"field\">\n                <label for=\"reelTime\">Reel Zeit</label>\n                <input id=\"reelTime\" name=\"reelTime\" value=\"08:30\">\n              </div>\n              <div class=\"field\">\n                <label for=\"storyTime\">Story Zeit</label>\n                <input id=\"storyTime\" name=\"storyTime\" value=\"09:00\">\n              </div>\n              <div class=\"field full\">\n                <label for=\"positioning\">Positionierung</label>\n                <textarea id=\"positioning\" name=\"positioning\" placeholder=\"Wofür steht der Kunde? Was soll Social Media verkaufen oder erklären?\"></textarea>\n              </div>\n              <div class=\"field full\">\n                <label>Onboarding Checklist</label>\n                <div class=\"check-grid\">\n                  <label class=\"check-label\"><input id=\"profileComplete\" name=\"profileComplete\" type=\"checkbox\"> Profil vollständig</label>\n                  <label class=\"check-label\"><input id=\"brandComplete\" name=\"brandComplete\" type=\"checkbox\"> Logo / Marke vollständig</label>\n                  <label class=\"check-label\"><input id=\"productPhotos\" name=\"productPhotos\" type=\"checkbox\"> Produktfotos vorhanden</label>\n                  <label class=\"check-label\"><input id=\"productList\" name=\"productList\" type=\"checkbox\"> Produktliste / Preise vorhanden</label>\n                  <label class=\"check-label\"><input id=\"instagramBusiness\" name=\"instagramBusiness\" type=\"checkbox\"> Instagram Business verbunden</label>\n                  <label class=\"check-label\"><input id=\"facebookPage\" name=\"facebookPage\" type=\"checkbox\"> Facebook Page verbunden</label>\n                  <label class=\"check-label\"><input id=\"metaAccess\" name=\"metaAccess\" type=\"checkbox\"> Meta Business Zugriff erteilt</label>\n                  <label class=\"check-label\"><input id=\"contentPlan\" name=\"contentPlan\" type=\"checkbox\"> Content Plan eingerichtet</label>\n                </div>\n              </div>\n              <div class=\"field full\">\n                <label for=\"publishPermission\">Yayın onayı</label>\n                <select id=\"publishPermission\" name=\"publishPermission\">\n                  <option value=\"missing\">Noch offen</option>\n                  <option value=\"approval\">Erst Freigabe, dann Publish</option>\n                  <option value=\"direct\">Direkt veröffentlichen erlaubt</option>\n                </select>\n              </div>\n              <div class=\"field full\">\n                <label for=\"onboardingNotes\">Onboarding Notizen</label>\n                <textarea id=\"onboardingNotes\" name=\"notes\" placeholder=\"Was fehlt noch? Wer muss was liefern?\"></textarea>\n              </div>\n              <div class=\"form-actions\">\n                <button class=\"btn orange\" id=\"submitCustomer\" type=\"submit\">Kunde anlegen</button>\n                <button class=\"btn secondary\" id=\"resetForm\" type=\"button\">Neu</button>\n                <span class=\"small\" id=\"customerFormStatus\"></span>\n              </div>\n            </form>\n          </div>\n        </section>\n      </main>\n    </div>\n    <script>\n      const $ = (id) => document.getElementById(id);\n      const state = { customers: [], editingId: \"\" };\n\n      async function api(path, options) {\n        const response = await fetch(path, options);\n        const data = await response.json();\n        if (!response.ok) throw new Error(data.error || \"API Fehler\");\n        return data;\n      }\n\n      function escapeHtml(value) {\n        return String(value ?? \"\")\n          .replaceAll(\"&\", \"&amp;\")\n          .replaceAll(\"<\", \"&lt;\")\n          .replaceAll(\">\", \"&gt;\")\n          .replaceAll('\"', \"&quot;\")\n          .replaceAll(\"'\", \"&#039;\");\n      }\n\n      function onboardingStatus(customer) {\n        const ob = customer.onboarding || {};\n        const mediaOk = Boolean(ob.productPhotos && ob.productList && ob.instagramBusiness && ob.facebookPage && ob.metaAccess && ob.publishPermission !== \"missing\");\n        if (!ob.profileComplete) return { label: \"Profil eksik\", cls: \"red\" };\n        if (!ob.brandComplete) return { label: \"Marka bilgileri eksik\", cls: \"orange\" };\n        if (!mediaOk) return { label: \"Medya erişimi eksik\", cls: \"orange\" };\n        if (!ob.contentPlan) return { label: \"İçerik planı eksik\", cls: \"orange\" };\n        return { label: \"Yayına hazır\", cls: \"green\" };\n      }\n\n      function checklist(customer) {\n        const ob = customer.onboarding || {};\n        return [\n          [\"Profil\", ob.profileComplete],\n          [\"Logo / Marka\", ob.brandComplete],\n          [\"Ürün foto\", ob.productPhotos],\n          [\"Ürün liste\", ob.productList],\n          [\"Instagram Business\", ob.instagramBusiness],\n          [\"Facebook Page\", ob.facebookPage],\n          [\"Meta Zugriff\", ob.metaAccess],\n          [\"Content Plan\", ob.contentPlan],\n        ].map(([label, ok]) => `\n          <div class=\"check-item\"><span class=\"check-dot ${ok ? \"ok\" : \"\"}\"></span>${label}</div>\n        `).join(\"\");\n      }\n\n      function renderCustomers(customers = []) {\n        state.customers = customers;\n        $(\"customerList\").innerHTML = customers.map((customer) => `\n          <article class=\"customer-card\">\n            <h3>${escapeHtml(customer.company || customer.name)}</h3>\n            <div>\n              <span class=\"pill green\">${escapeHtml(customer.status || \"active\")}</span>\n              <span class=\"pill ${onboardingStatus(customer).cls}\">${onboardingStatus(customer).label}</span>\n              ${customer.instagram ? `<span class=\"pill\">${escapeHtml(customer.instagram)}</span>` : \"\"}\n              ${customer.language ? `<span class=\"pill gray\">${escapeHtml(customer.language)}</span>` : \"\"}\n            </div>\n            <div class=\"customer-meta small\">\n              <div><strong>ID</strong><br>${escapeHtml(customer.id)}</div>\n              <div><strong>Branche</strong><br>${escapeHtml(customer.industry || \"-\")}</div>\n              <div><strong>Kontakt</strong><br>${escapeHtml(customer.owner || \"-\")}</div>\n              <div><strong>Ort</strong><br>${escapeHtml(customer.city || \"-\")}</div>\n            </div>\n            <div class=\"checklist\">${checklist(customer)}</div>\n            ${customer.onboarding?.notes ? `<p class=\"small\" style=\"margin:12px 0 0\"><strong>Notiz:</strong> ${escapeHtml(customer.onboarding.notes)}</p>` : \"\"}\n            ${customer.positioning ? `<p class=\"small\" style=\"margin:12px 0 0\">${escapeHtml(customer.positioning)}</p>` : \"\"}\n            <button class=\"btn secondary small js-edit-customer\" type=\"button\" data-id=\"${escapeHtml(customer.id)}\">Bearbeiten</button>\n            <a class=\"btn secondary small\" href=\"/kunde/${encodeURIComponent(customer.id)}\">Kundenseite öffnen</a>\n          </article>\n        `).join(\"\") || `<div class=\"small\">Noch keine Kunden angelegt.</div>`;\n      }\n\n      function resetCustomerForm() {\n        state.editingId = \"\";\n        $(\"customerForm\").reset();\n        $(\"customerId\").value = \"\";\n        $(\"primary\").value = \"#3ABADF\";\n        $(\"accent\").value = \"#FF6B00\";\n        $(\"language\").value = \"de\";\n        $(\"carouselTime\").value = \"08:00\";\n        $(\"reelTime\").value = \"08:30\";\n        $(\"storyTime\").value = \"09:00\";\n        $(\"publishPermission\").value = \"missing\";\n        $(\"formTitle\").textContent = \"Kunde anlegen\";\n        $(\"submitCustomer\").textContent = \"Kunde anlegen\";\n        $(\"customerFormStatus\").textContent = \"\";\n      }\n\n      function editCustomer(id) {\n        const customer = state.customers.find((item) => item.id === id);\n        if (!customer) return;\n        const ob = customer.onboarding || {};\n        state.editingId = customer.id;\n        $(\"customerId\").value = customer.id;\n        $(\"company\").value = customer.company || customer.name || \"\";\n        $(\"owner\").value = customer.owner || \"\";\n        $(\"email\").value = customer.email || \"\";\n        $(\"phone\").value = customer.phone || \"\";\n        $(\"city\").value = customer.city || \"\";\n        $(\"instagram\").value = customer.instagram || \"\";\n        $(\"industry\").value = customer.industry || \"\";\n        $(\"language\").value = customer.language || \"de\";\n        $(\"primary\").value = customer.brand?.primary || \"#3ABADF\";\n        $(\"accent\").value = customer.brand?.accent || \"#FF6B00\";\n        $(\"topics\").value = (customer.topics || []).join(\", \");\n        $(\"carouselTime\").value = customer.cadence?.carousel || \"08:00\";\n        $(\"reelTime\").value = customer.cadence?.reel || \"08:30\";\n        $(\"storyTime\").value = customer.cadence?.story || \"09:00\";\n        $(\"positioning\").value = customer.positioning || \"\";\n        $(\"profileComplete\").checked = Boolean(ob.profileComplete);\n        $(\"brandComplete\").checked = Boolean(ob.brandComplete);\n        $(\"productPhotos\").checked = Boolean(ob.productPhotos);\n        $(\"productList\").checked = Boolean(ob.productList);\n        $(\"instagramBusiness\").checked = Boolean(ob.instagramBusiness);\n        $(\"facebookPage\").checked = Boolean(ob.facebookPage);\n        $(\"metaAccess\").checked = Boolean(ob.metaAccess);\n        $(\"contentPlan\").checked = Boolean(ob.contentPlan);\n        $(\"publishPermission\").value = ob.publishPermission || \"missing\";\n        $(\"onboardingNotes\").value = ob.notes || \"\";\n        $(\"formTitle\").textContent = `${customer.company || customer.name} bearbeiten`;\n        $(\"submitCustomer\").textContent = \"Kunde speichern\";\n        $(\"customerFormStatus\").textContent = \"Bearbeitungsmodus\";\n        window.scrollTo({ top: 0, behavior: \"smooth\" });\n      }\n\n      async function refreshCustomers() {\n        const data = await api(\"/api/customers\");\n        renderCustomers(data.customers || []);\n      }\n\n      async function createCustomer(event) {\n        event.preventDefault();\n        const form = event.currentTarget;\n        const status = $(\"customerFormStatus\");\n        const button = form.querySelector(\"button[type='submit']\");\n        status.textContent = \"Speichern...\";\n        button.disabled = true;\n        const payload = Object.fromEntries(new FormData(form).entries());\n        payload.secondary = payload.primary || \"#41AADE\";\n        for (const key of [\"profileComplete\", \"brandComplete\", \"productPhotos\", \"productList\", \"instagramBusiness\", \"facebookPage\", \"metaAccess\", \"contentPlan\"]) {\n          payload[key] = form.elements[key].checked;\n        }\n        try {\n          const path = state.editingId ? `/api/customers/${encodeURIComponent(state.editingId)}` : \"/api/customers\";\n          await api(path, {\n            method: state.editingId ? \"PUT\" : \"POST\",\n            headers: { \"Content-Type\": \"application/json\" },\n            body: JSON.stringify(payload),\n          });\n          status.textContent = state.editingId ? \"Kunde gespeichert.\" : \"Kunde angelegt.\";\n          resetCustomerForm();\n          await refreshCustomers();\n        } catch (error) {\n          status.textContent = error.message;\n        } finally {\n          button.disabled = false;\n        }\n      }\n\n      $(\"customerForm\").addEventListener(\"submit\", createCustomer);\n      $(\"resetForm\").addEventListener(\"click\", resetCustomerForm);\n      document.addEventListener(\"click\", (event) => {\n        const edit = event.target.closest(\".js-edit-customer\");\n        if (edit) editCustomer(edit.dataset.id);\n      });\n      refreshCustomers().catch((error) => {\n        $(\"customerList\").textContent = error.message;\n      });\n    </script>\n  </body>\n</html>\n";
const HOME_HTML = "<!doctype html>\n<html lang=\"de\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Hasi Social Media | Automatisierte Inhalte für lokale Unternehmen</title>\n    <meta name=\"description\" content=\"Hasi Social Media plant, erstellt und veröffentlicht Instagram-Inhalte für lokale Unternehmen mit Freigabe, Kalender und Kundenportal.\" />\n    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />\n    <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Nunito+Sans:wght@400;500;600;700;800&display=swap\" rel=\"stylesheet\" />\n    <style>\n      :root {\n        --blue: #3abadf;\n        --blue-dark: #117392;\n        --ink: #101828;\n        --navy: #0b1c2a;\n        --muted: #5d6b82;\n        --line: #d8eef5;\n        --soft: #eef9fd;\n        --orange: #ff6b00;\n        --green: #16a765;\n      }\n      * { box-sizing: border-box; }\n      html { scroll-behavior: smooth; }\n      body {\n        margin: 0;\n        font-family: \"Nunito Sans\", system-ui, sans-serif;\n        color: var(--ink);\n        background: #f4fbfe;\n      }\n      a { color: inherit; text-decoration: none; }\n      h1, h2, h3, h4, .brand strong {\n        font-family: \"Plus Jakarta Sans\", \"Nunito Sans\", system-ui, sans-serif;\n      }\n      .topbar {\n        position: sticky;\n        top: 0;\n        z-index: 10;\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        gap: 24px;\n        padding: 18px clamp(18px, 5vw, 72px);\n        border-bottom: 1px solid rgba(216, 238, 245, .8);\n        background: rgba(244, 251, 254, .92);\n        backdrop-filter: blur(14px);\n      }\n      .brand {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n        min-width: 220px;\n      }\n      .brand img {\n        width: 52px;\n        height: 52px;\n        border-radius: 8px;\n        background: #fff;\n        object-fit: contain;\n        padding: 7px;\n        box-shadow: 0 10px 24px rgba(17, 115, 146, .12);\n      }\n      .brand strong { display: block; font-size: 17px; }\n      .brand span { display: block; color: var(--blue-dark); font-size: 13px; font-weight: 700; }\n      .nav {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        color: var(--muted);\n        font-size: 14px;\n        font-weight: 700;\n      }\n      .nav a { padding: 10px 12px; border-radius: 8px; }\n      .nav a:hover { background: #e7f6fb; color: var(--ink); }\n      .actions { display: flex; gap: 10px; align-items: center; }\n      .button {\n        display: inline-flex;\n        align-items: center;\n        justify-content: center;\n        min-height: 44px;\n        padding: 0 18px;\n        border-radius: 8px;\n        border: 1px solid var(--line);\n        background: #fff;\n        color: var(--ink);\n        font-weight: 800;\n        box-shadow: 0 8px 20px rgba(17, 115, 146, .08);\n      }\n      .button.primary {\n        border-color: var(--orange);\n        background: var(--orange);\n        color: #fff;\n      }\n      .hero {\n        display: grid;\n        grid-template-columns: minmax(0, 1fr) minmax(360px, .82fr);\n        gap: clamp(28px, 5vw, 78px);\n        align-items: center;\n        padding: clamp(46px, 8vw, 104px) clamp(18px, 5vw, 72px) 42px;\n        min-height: calc(100vh - 89px);\n        background:\n          linear-gradient(135deg, rgba(58, 186, 223, .16), rgba(255, 255, 255, 0) 44%),\n          linear-gradient(180deg, #f4fbfe 0%, #fff 100%);\n      }\n      .eyebrow {\n        display: inline-flex;\n        align-items: center;\n        gap: 8px;\n        margin-bottom: 18px;\n        padding: 7px 10px;\n        border: 1px solid var(--line);\n        border-radius: 8px;\n        background: #fff;\n        color: var(--blue-dark);\n        font-size: 13px;\n        font-weight: 800;\n      }\n      .eyebrow::before {\n        content: \"\";\n        width: 8px;\n        height: 8px;\n        border-radius: 50%;\n        background: var(--green);\n      }\n      h1 {\n        max-width: 900px;\n        margin: 0;\n        font-size: clamp(44px, 7vw, 84px);\n        line-height: .95;\n        letter-spacing: 0;\n      }\n      .lead {\n        max-width: 720px;\n        margin: 24px 0 0;\n        color: var(--muted);\n        font-size: clamp(18px, 2vw, 22px);\n        line-height: 1.45;\n      }\n      .hero-actions {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 12px;\n        margin-top: 32px;\n      }\n      .proof {\n        display: grid;\n        grid-template-columns: repeat(3, minmax(0, 1fr));\n        gap: 12px;\n        margin-top: 38px;\n        max-width: 760px;\n      }\n      .proof div {\n        border-top: 2px solid var(--line);\n        padding-top: 12px;\n        color: var(--muted);\n        font-size: 13px;\n        font-weight: 700;\n      }\n      .proof strong { display: block; color: var(--ink); font-size: 22px; margin-bottom: 3px; }\n      .stage {\n        position: relative;\n        min-height: 560px;\n      }\n      .dashboard {\n        position: absolute;\n        inset: 18px 0 auto auto;\n        width: min(520px, 100%);\n        padding: 18px;\n        border: 1px solid var(--line);\n        border-radius: 10px;\n        background: rgba(255, 255, 255, .94);\n        box-shadow: 0 28px 70px rgba(16, 24, 40, .14);\n      }\n      .dash-head {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        margin-bottom: 16px;\n        font-weight: 800;\n      }\n      .status-pill {\n        padding: 7px 10px;\n        border-radius: 8px;\n        background: #e9fbf3;\n        color: #087443;\n        font-size: 12px;\n      }\n      .calendar-row {\n        display: grid;\n        grid-template-columns: 70px 1fr 66px;\n        gap: 12px;\n        align-items: center;\n        padding: 12px;\n        border-top: 1px solid #edf4f7;\n      }\n      .calendar-row b { font-size: 14px; }\n      .calendar-row span { color: var(--muted); font-size: 12px; font-weight: 700; }\n      .slot {\n        text-align: center;\n        padding: 7px 8px;\n        border-radius: 8px;\n        background: var(--soft);\n        color: var(--blue-dark);\n        font-size: 12px;\n        font-weight: 800;\n      }\n      .phone {\n        position: absolute;\n        left: 0;\n        bottom: 0;\n        width: 245px;\n        padding: 14px;\n        border-radius: 28px;\n        background: var(--navy);\n        box-shadow: 0 28px 70px rgba(16, 24, 40, .22);\n        animation: phoneFloat 6s ease-in-out infinite;\n      }\n      .screen {\n        overflow: hidden;\n        min-height: 420px;\n        border-radius: 18px;\n        background: #fff;\n      }\n      .post {\n        height: 420px;\n        padding: 18px;\n        background:\n          linear-gradient(140deg, #fff 0 58%, rgba(58, 186, 223, .18) 58%),\n          #fff;\n      }\n      .post-logo {\n        width: 46px;\n        height: 22px;\n        margin-bottom: 58px;\n        object-fit: contain;\n      }\n      .post h3 { margin: 0; font-size: 28px; line-height: 1.03; }\n      .post p { margin: 12px 0 0; color: var(--muted); font-size: 13px; line-height: 1.35; }\n      .progress {\n        position: absolute;\n        right: 24px;\n        bottom: 38px;\n        width: 230px;\n        padding: 14px;\n        border: 1px solid var(--line);\n        border-radius: 10px;\n        background: #fff;\n        box-shadow: 0 20px 46px rgba(16, 24, 40, .14);\n      }\n      .progress span { color: var(--muted); font-size: 12px; font-weight: 800; }\n      .bar {\n        overflow: hidden;\n        height: 8px;\n        margin-top: 10px;\n        border-radius: 8px;\n        background: #e8f4f8;\n      }\n      .bar::after {\n        content: \"\";\n        display: block;\n        width: 100%;\n        height: 100%;\n        border-radius: 8px;\n        background: var(--orange);\n        transform-origin: left;\n        animation: publishBar 4s ease-in-out infinite;\n      }\n      .section {\n        padding: 68px clamp(18px, 5vw, 72px);\n        background: #fff;\n      }\n      .section.soft { background: #f4fbfe; }\n      .section-head {\n        display: flex;\n        align-items: end;\n        justify-content: space-between;\n        gap: 24px;\n        margin-bottom: 28px;\n      }\n      h2 {\n        margin: 0;\n        font-size: clamp(30px, 4vw, 48px);\n        line-height: 1.05;\n        letter-spacing: 0;\n      }\n      .section-head p {\n        max-width: 560px;\n        margin: 0;\n        color: var(--muted);\n        line-height: 1.5;\n      }\n      .grid {\n        display: grid;\n        grid-template-columns: repeat(3, minmax(0, 1fr));\n        gap: 16px;\n      }\n      .card {\n        min-height: 210px;\n        padding: 22px;\n        border: 1px solid var(--line);\n        border-radius: 8px;\n        background: #fff;\n      }\n      .card .num {\n        display: inline-grid;\n        place-items: center;\n        width: 34px;\n        height: 34px;\n        margin-bottom: 34px;\n        border-radius: 8px;\n        background: var(--soft);\n        color: var(--blue-dark);\n        font-weight: 900;\n      }\n      .card h3 { margin: 0 0 10px; font-size: 21px; }\n      .card p { margin: 0; color: var(--muted); line-height: 1.5; }\n      .workflow {\n        display: grid;\n        grid-template-columns: repeat(5, minmax(0, 1fr));\n        gap: 12px;\n      }\n      .step {\n        position: relative;\n        min-height: 150px;\n        padding: 18px;\n        border: 1px solid var(--line);\n        border-radius: 8px;\n        background: #fff;\n        animation: stepGlow 8s ease-in-out infinite;\n      }\n      .step:nth-child(2) { animation-delay: 1.2s; }\n      .step:nth-child(3) { animation-delay: 2.4s; }\n      .step:nth-child(4) { animation-delay: 3.6s; }\n      .step:nth-child(5) { animation-delay: 4.8s; }\n      .step small { color: var(--blue-dark); font-weight: 900; }\n      .step b { display: block; margin-top: 22px; font-size: 18px; }\n      .step span { display: block; margin-top: 8px; color: var(--muted); font-size: 13px; line-height: 1.4; }\n      .cta-band {\n        display: grid;\n        grid-template-columns: 1fr auto;\n        gap: 24px;\n        align-items: center;\n        padding: 34px;\n        border-radius: 10px;\n        background: var(--navy);\n        color: #fff;\n      }\n      .cta-band p { margin: 8px 0 0; color: rgba(255,255,255,.72); }\n      footer {\n        display: flex;\n        justify-content: space-between;\n        gap: 24px;\n        padding: 28px clamp(18px, 5vw, 72px);\n        color: var(--muted);\n        background: #fff;\n        border-top: 1px solid var(--line);\n        font-size: 13px;\n      }\n      @keyframes phoneFloat {\n        0%, 100% { transform: translateY(0); }\n        50% { transform: translateY(-12px); }\n      }\n      @keyframes publishBar {\n        0% { transform: scaleX(.12); }\n        55% { transform: scaleX(.82); }\n        100% { transform: scaleX(1); }\n      }\n      @keyframes stepGlow {\n        0%, 100% { border-color: var(--line); box-shadow: none; }\n        35% { border-color: rgba(58, 186, 223, .7); box-shadow: 0 18px 38px rgba(17, 115, 146, .11); }\n      }\n      @media (max-width: 1020px) {\n        .hero { grid-template-columns: 1fr; }\n        .stage { min-height: 620px; }\n        .dashboard { left: 120px; right: auto; }\n        .grid { grid-template-columns: 1fr 1fr; }\n        .workflow { grid-template-columns: 1fr 1fr; }\n      }\n      @media (max-width: 760px) {\n        .topbar { position: static; align-items: flex-start; flex-direction: column; }\n        .nav { display: none; }\n        .actions { width: 100%; }\n        .actions .button { flex: 1; }\n        .hero { min-height: auto; padding-top: 38px; }\n        .proof, .grid, .workflow, .cta-band { grid-template-columns: 1fr; }\n        .stage { min-height: 760px; }\n        .dashboard, .phone, .progress { position: relative; inset: auto; width: 100%; margin-top: 16px; }\n        .phone { max-width: 280px; margin-inline: auto; }\n        footer { flex-direction: column; }\n      }\n    </style>\n  </head>\n  <body>\n    <header class=\"topbar\">\n      <a class=\"brand\" href=\"/\">\n        <img src=\"/hasi-logo.png\" alt=\"Hasi Elektronic Logo\" />\n        <span><strong>Hasi Social Media</strong><span>by Hasi Elektronic</span></span>\n      </a>\n      <nav class=\"nav\" aria-label=\"Hauptnavigation\">\n        <a href=\"#leistung\">Leistung</a>\n        <a href=\"#ablauf\">Ablauf</a>\n        <a href=\"/demo\">Demo</a>\n      </nav>\n      <div class=\"actions\">\n        <a class=\"button\" href=\"/login?next=%2Fapp\">Anmelden</a>\n        <a class=\"button primary\" href=\"/demo\">Demo ansehen</a>\n      </div>\n    </header>\n\n    <main>\n      <section class=\"hero\">\n        <div>\n          <div class=\"eyebrow\">Social-Media-Service für lokale Unternehmen</div>\n          <h1>Instagram-Inhalte, die geplant, geprüft und veröffentlicht werden.</h1>\n          <p class=\"lead\">Wir bauen für jedes Unternehmen einen klaren Redaktionsplan, erstellen Karussells, Reels und Storys und geben Dir eine einfache Freigabe-Zentrale.</p>\n          <div class=\"hero-actions\">\n            <a class=\"button primary\" href=\"/demo\">So funktioniert es</a>\n            <a class=\"button\" href=\"mailto:info@hasi-elektronic.de?subject=Hasi%20Social%20Media%20Anfrage\">Beratung anfragen</a>\n          </div>\n          <div class=\"proof\">\n            <div><strong>3 Formate</strong>Karussell, Reel und Story</div>\n            <div><strong>14 Tage</strong>Planung mit Themenrotation</div>\n            <div><strong>1 Portal</strong>Vorschau, Freigabe und Logs</div>\n          </div>\n        </div>\n\n        <div class=\"stage\" aria-label=\"Animierte Vorschau des Social-Media-Portals\">\n          <div class=\"dashboard\">\n            <div class=\"dash-head\">\n              <span>Content Plan</span>\n              <span class=\"status-pill\">publish-ready</span>\n            </div>\n            <div class=\"calendar-row\"><span>08:00</span><b>Karussell</b><div class=\"slot\">bereit</div></div>\n            <div class=\"calendar-row\"><span>08:30</span><b>Reel</b><div class=\"slot\">bereit</div></div>\n            <div class=\"calendar-row\"><span>09:00</span><b>Story</b><div class=\"slot\">bereit</div></div>\n            <div class=\"calendar-row\"><span>Freigabe</span><b>Kunde prüft Vorschau</b><div class=\"slot\">OK</div></div>\n          </div>\n          <div class=\"phone\">\n            <div class=\"screen\">\n              <article class=\"post\">\n                <img class=\"post-logo\" src=\"/hasi-logo.png\" alt=\"\" />\n                <h3>Dein Angebot sichtbar machen.</h3>\n                <p>Professionelle Posts für Kunden, die gerade nach Deinem Service suchen.</p>\n              </article>\n            </div>\n          </div>\n          <div class=\"progress\">\n            <span>Automatischer Workflow</span>\n            <div class=\"bar\"></div>\n          </div>\n        </div>\n      </section>\n\n      <section class=\"section\" id=\"leistung\">\n        <div class=\"section-head\">\n          <h2>Was Kunden bekommen</h2>\n          <p>Keine unklare Dateiablage und kein Hin und Her per Chat. Das System zeigt, was geplant ist, was freigegeben wurde und was bereits online ist.</p>\n        </div>\n        <div class=\"grid\">\n          <article class=\"card\"><span class=\"num\">1</span><h3>Marke sauber erfassen</h3><p>Logo, Farben, Angebot, Zielgruppe und Tonalität werden im Kundenprofil gesammelt.</p></article>\n          <article class=\"card\"><span class=\"num\">2</span><h3>Inhalte vorbereiten</h3><p>Karussells, Reels und Storys entstehen aus einem wiederholbaren Produktionsprozess.</p></article>\n          <article class=\"card\"><span class=\"num\">3</span><h3>Freigabe einfach machen</h3><p>Der Kunde sieht Vorschau, Caption, Datum und Status vor der Veröffentlichung.</p></article>\n        </div>\n      </section>\n\n      <section class=\"section soft\" id=\"ablauf\">\n        <div class=\"section-head\">\n          <h2>Vom Kundenprofil bis Instagram</h2>\n          <p>Der Ablauf ist bewusst schlank: erst Daten sauber sammeln, dann planen, dann automatisch produzieren und kontrolliert veröffentlichen.</p>\n        </div>\n        <div class=\"workflow\">\n          <div class=\"step\"><small>01</small><b>Kunde anlegen</b><span>Branche, Angebot, Standort und Marke erfassen.</span></div>\n          <div class=\"step\"><small>02</small><b>Plan bauen</b><span>Themen, Zeiten und Formate für 14 Tage festlegen.</span></div>\n          <div class=\"step\"><small>03</small><b>Content erstellen</b><span>Slides, Reels und Storys werden vorbereitet.</span></div>\n          <div class=\"step\"><small>04</small><b>Prüfen</b><span>Vorschau ansehen, Caption lesen, Freigabe setzen.</span></div>\n          <div class=\"step\"><small>05</small><b>Publish</b><span>Veröffentlichung mit Status und Log dokumentieren.</span></div>\n        </div>\n      </section>\n\n      <section class=\"section\">\n        <div class=\"cta-band\">\n          <div>\n            <h2>Bereit für einen sauberen Social-Media-Prozess?</h2>\n            <p>Die Demo zeigt den Ablauf, bevor ein echter Kundenzugang eingerichtet wird.</p>\n          </div>\n          <a class=\"button primary\" href=\"/demo\">Demo starten</a>\n        </div>\n      </section>\n    </main>\n\n    <footer>\n      <span>Hasi Elektronic · Grabenstraße 18 · 71665 Vaihingen/Enz</span>\n      <span>Hasi Social Media · Kundenportal unter /app</span>\n    </footer>\n  </body>\n</html>\n";
const DEMO_HTML = "<!doctype html>\n<html lang=\"de\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Demo | Hasi Social Media</title>\n    <meta name=\"description\" content=\"Animierte Demo: So entsteht ein Social-Media-Beitrag im Hasi Social Media Kundenportal.\" />\n    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />\n    <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Nunito+Sans:wght@400;500;600;700;800&display=swap\" rel=\"stylesheet\" />\n    <style>\n      :root {\n        --blue: #3abadf;\n        --blue-dark: #117392;\n        --ink: #101828;\n        --navy: #0b1c2a;\n        --muted: #667085;\n        --line: #d8eef5;\n        --soft: #eef9fd;\n        --orange: #ff6b00;\n        --green: #16a765;\n      }\n      * { box-sizing: border-box; }\n      body {\n        margin: 0;\n        min-height: 100vh;\n        font-family: \"Nunito Sans\", system-ui, sans-serif;\n        color: var(--ink);\n        background: linear-gradient(180deg, #f4fbfe 0%, #fff 44%, #eef9fd 100%);\n      }\n      a { color: inherit; text-decoration: none; }\n      h1, h2, h3, h4, .brand {\n        font-family: \"Plus Jakarta Sans\", \"Nunito Sans\", system-ui, sans-serif;\n      }\n      .topbar {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        gap: 20px;\n        padding: 18px clamp(18px, 5vw, 70px);\n        border-bottom: 1px solid var(--line);\n        background: rgba(255, 255, 255, .92);\n        backdrop-filter: blur(14px);\n      }\n      .brand {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n        font-weight: 800;\n      }\n      .brand img {\n        width: 52px;\n        height: 52px;\n        border-radius: 8px;\n        padding: 7px;\n        background: #fff;\n        object-fit: contain;\n        box-shadow: 0 10px 24px rgba(17, 115, 146, .12);\n      }\n      .brand span { display: block; color: var(--blue-dark); font-size: 13px; }\n      .button {\n        display: inline-flex;\n        align-items: center;\n        justify-content: center;\n        min-height: 44px;\n        padding: 0 18px;\n        border-radius: 8px;\n        border: 1px solid var(--line);\n        background: #fff;\n        font-weight: 800;\n        box-shadow: 0 8px 20px rgba(17, 115, 146, .08);\n      }\n      .button.primary {\n        border-color: var(--orange);\n        background: var(--orange);\n        color: #fff;\n      }\n      .hero {\n        padding: clamp(36px, 6vw, 78px) clamp(18px, 5vw, 70px) 28px;\n        text-align: center;\n      }\n      .eyebrow {\n        display: inline-flex;\n        padding: 8px 11px;\n        border: 1px solid var(--line);\n        border-radius: 8px;\n        background: #fff;\n        color: var(--blue-dark);\n        font-size: 13px;\n        font-weight: 900;\n      }\n      h1 {\n        max-width: 980px;\n        margin: 18px auto 0;\n        font-size: clamp(40px, 7vw, 76px);\n        line-height: .98;\n        letter-spacing: 0;\n      }\n      .lead {\n        max-width: 760px;\n        margin: 22px auto 0;\n        color: var(--muted);\n        font-size: 20px;\n        line-height: 1.45;\n      }\n      .demo-stage {\n        display: grid;\n        grid-template-columns: 300px minmax(0, 1fr) 300px;\n        gap: 20px;\n        align-items: stretch;\n        padding: 24px clamp(18px, 5vw, 70px) 72px;\n      }\n      .panel {\n        border: 1px solid var(--line);\n        border-radius: 10px;\n        background: rgba(255,255,255,.94);\n        box-shadow: 0 24px 60px rgba(16, 24, 40, .1);\n      }\n      .panel-head {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        gap: 12px;\n        padding: 16px;\n        border-bottom: 1px solid #edf4f7;\n        font-weight: 900;\n      }\n      .pill {\n        padding: 6px 9px;\n        border-radius: 8px;\n        background: var(--soft);\n        color: var(--blue-dark);\n        font-size: 12px;\n        font-weight: 900;\n      }\n      .customer-card {\n        margin: 16px;\n        padding: 16px;\n        border: 1px solid var(--line);\n        border-radius: 8px;\n        background: #f8fcfe;\n        animation: cardPulse 6s ease-in-out infinite;\n      }\n      .customer-card h2 { margin: 0 0 8px; font-size: 22px; }\n      .customer-card p { margin: 0; color: var(--muted); line-height: 1.45; }\n      .check {\n        display: flex;\n        justify-content: space-between;\n        gap: 12px;\n        padding: 12px 16px;\n        border-top: 1px solid #edf4f7;\n        color: var(--muted);\n        font-size: 13px;\n        font-weight: 800;\n      }\n      .dot {\n        width: 20px;\n        height: 20px;\n        border-radius: 50%;\n        background: #e9fbf3;\n        color: var(--green);\n        display: inline-grid;\n        place-items: center;\n        font-size: 12px;\n        font-weight: 900;\n      }\n      .machine {\n        position: relative;\n        overflow: hidden;\n        min-height: 600px;\n        padding: 22px;\n      }\n      .track {\n        position: absolute;\n        left: 42px;\n        right: 42px;\n        top: 52%;\n        height: 8px;\n        border-radius: 8px;\n        background: #e6f4f8;\n      }\n      .track::after {\n        content: \"\";\n        display: block;\n        height: 100%;\n        border-radius: 8px;\n        background: var(--orange);\n        transform-origin: left;\n        animation: lineFill 8s ease-in-out infinite;\n      }\n      .bubble {\n        position: absolute;\n        display: grid;\n        place-items: center;\n        width: 122px;\n        height: 92px;\n        border: 1px solid var(--line);\n        border-radius: 10px;\n        background: #fff;\n        box-shadow: 0 18px 42px rgba(16, 24, 40, .12);\n        text-align: center;\n        font-weight: 900;\n        animation: bubbleFocus 8s ease-in-out infinite;\n      }\n      .bubble small { display: block; margin-top: 6px; color: var(--muted); font-size: 12px; font-weight: 800; }\n      .b1 { left: 6%; top: 26%; animation-delay: 0s; }\n      .b2 { left: 28%; top: 62%; animation-delay: 1.35s; }\n      .b3 { left: 49%; top: 25%; animation-delay: 2.7s; }\n      .b4 { left: 68%; top: 62%; animation-delay: 4.05s; }\n      .b5 { right: 4%; top: 26%; animation-delay: 5.4s; }\n      .content-preview {\n        position: absolute;\n        left: 50%;\n        top: 50%;\n        width: 210px;\n        height: 270px;\n        padding: 16px;\n        transform: translate(-50%, -50%);\n        border-radius: 14px;\n        background:\n          linear-gradient(145deg, #fff 0 60%, rgba(58, 186, 223, .2) 60%),\n          #fff;\n        border: 1px solid var(--line);\n        box-shadow: 0 28px 70px rgba(16, 24, 40, .18);\n        animation: previewSpin 8s ease-in-out infinite;\n      }\n      .content-preview img { width: 48px; height: 24px; object-fit: contain; }\n      .content-preview h3 { margin: 74px 0 0; font-size: 24px; line-height: 1.05; }\n      .content-preview p { margin: 10px 0 0; color: var(--muted); font-size: 12px; line-height: 1.35; }\n      .queue { padding-bottom: 12px; }\n      .queue-row {\n        display: grid;\n        grid-template-columns: 64px 1fr;\n        gap: 12px;\n        padding: 14px 16px;\n        border-top: 1px solid #edf4f7;\n      }\n      .thumb {\n        height: 76px;\n        border-radius: 8px;\n        background:\n          linear-gradient(145deg, #fff 0 60%, rgba(58, 186, 223, .22) 60%),\n          #fff;\n        border: 1px solid var(--line);\n      }\n      .queue-row b { display: block; margin: 2px 0 6px; }\n      .queue-row span { display: block; color: var(--muted); font-size: 12px; line-height: 1.35; }\n      .publish {\n        display: inline-flex;\n        margin-top: 10px;\n        padding: 8px 10px;\n        border-radius: 8px;\n        background: var(--orange);\n        color: #fff;\n        font-size: 12px;\n        font-weight: 900;\n      }\n      .timeline {\n        display: grid;\n        grid-template-columns: repeat(5, minmax(0, 1fr));\n        gap: 12px;\n        padding: 0 clamp(18px, 5vw, 70px) 44px;\n      }\n      .step {\n        min-height: 136px;\n        padding: 16px;\n        border: 1px solid var(--line);\n        border-radius: 8px;\n        background: #fff;\n      }\n      .step small { color: var(--blue-dark); font-weight: 900; }\n      .step b { display: block; margin-top: 18px; }\n      .step span { display: block; margin-top: 8px; color: var(--muted); font-size: 13px; line-height: 1.4; }\n      .bottom-actions {\n        display: flex;\n        flex-wrap: wrap;\n        justify-content: center;\n        gap: 12px;\n        padding: 0 18px 70px;\n      }\n      @keyframes lineFill {\n        0% { transform: scaleX(.06); }\n        18% { transform: scaleX(.25); }\n        38% { transform: scaleX(.5); }\n        60% { transform: scaleX(.74); }\n        100% { transform: scaleX(1); }\n      }\n      @keyframes bubbleFocus {\n        0%, 100% { transform: translateY(0); border-color: var(--line); }\n        25% { transform: translateY(-12px); border-color: var(--blue); box-shadow: 0 26px 54px rgba(17, 115, 146, .2); }\n      }\n      @keyframes previewSpin {\n        0%, 100% { transform: translate(-50%, -50%) rotate(-2deg) scale(1); }\n        45% { transform: translate(-50%, -50%) rotate(2deg) scale(1.04); }\n      }\n      @keyframes cardPulse {\n        0%, 100% { border-color: var(--line); }\n        50% { border-color: rgba(58, 186, 223, .8); box-shadow: 0 16px 34px rgba(17, 115, 146, .12); }\n      }\n      @media (max-width: 1100px) {\n        .demo-stage { grid-template-columns: 1fr; }\n        .machine { min-height: 620px; }\n        .timeline { grid-template-columns: 1fr 1fr; }\n      }\n      @media (max-width: 720px) {\n        .topbar { flex-direction: column; align-items: flex-start; }\n        .machine { min-height: 820px; }\n        .track { display: none; }\n        .bubble { position: relative; left: auto; right: auto; top: auto; width: 100%; margin: 10px 0; }\n        .content-preview { position: relative; left: auto; top: auto; margin: 20px auto; transform: none; animation: none; }\n        .timeline { grid-template-columns: 1fr; }\n      }\n    </style>\n  </head>\n  <body>\n    <header class=\"topbar\">\n      <a class=\"brand\" href=\"/\">\n        <img src=\"/hasi-logo.png\" alt=\"Hasi Elektronic Logo\" />\n        <span>Hasi Social Media<span>Demo Ablauf</span></span>\n      </a>\n      <div>\n        <a class=\"button\" href=\"/\">Startseite</a>\n        <a class=\"button primary\" href=\"/login?next=%2Fapp\">Anmelden</a>\n      </div>\n    </header>\n\n    <main>\n      <section class=\"hero\">\n        <div class=\"eyebrow\">Animierte Beispielstrecke</div>\n        <h1>So wird aus Kundendaten ein veröffentlichter Beitrag.</h1>\n        <p class=\"lead\">Die Demo zeigt den geplanten Ablauf für neue Kunden: Onboarding, Content-Plan, Vorschau, Freigabe und Publish-Log.</p>\n      </section>\n\n      <section class=\"demo-stage\" aria-label=\"Animierter Workflow\">\n        <aside class=\"panel\">\n          <div class=\"panel-head\">Kundenprofil <span class=\"pill\">Demo</span></div>\n          <div class=\"customer-card\">\n            <h2>Restaurant Sonne</h2>\n            <p>Lokales Restaurant mit Mittagstisch, Events und Wochenkarte.</p>\n          </div>\n          <div class=\"check\"><span>Logo & Farben</span><span class=\"dot\">✓</span></div>\n          <div class=\"check\"><span>Produkte & Angebote</span><span class=\"dot\">✓</span></div>\n          <div class=\"check\"><span>Meta Zugriff</span><span class=\"dot\">✓</span></div>\n          <div class=\"check\"><span>Freigabe-Regel</span><span class=\"dot\">✓</span></div>\n        </aside>\n\n        <section class=\"panel machine\">\n          <div class=\"panel-head\">Automatischer Ablauf <span class=\"pill\">live animiert</span></div>\n          <div class=\"track\"></div>\n          <div class=\"bubble b1\">Profil<small>Daten sammeln</small></div>\n          <div class=\"bubble b2\">Plan<small>14 Tage</small></div>\n          <div class=\"bubble b3\">Design<small>Post bauen</small></div>\n          <div class=\"bubble b4\">Freigabe<small>Kunde prüft</small></div>\n          <div class=\"bubble b5\">Publish<small>Log speichern</small></div>\n          <article class=\"content-preview\">\n            <img src=\"/hasi-logo.png\" alt=\"\" />\n            <h3>Heute frisch gekocht.</h3>\n            <p>Mittagstisch, Angebot und klare Handlungsaufforderung für Instagram.</p>\n          </article>\n        </section>\n\n        <aside class=\"panel queue\">\n          <div class=\"panel-head\">Beiträge <span class=\"pill\">publish-ready</span></div>\n          <div class=\"queue-row\">\n            <div class=\"thumb\"></div>\n            <div><b>Karussell</b><span>7 Slides · 08:00 · wartet auf Freigabe</span><span class=\"publish\">Vorschau</span></div>\n          </div>\n          <div class=\"queue-row\">\n            <div class=\"thumb\"></div>\n            <div><b>Reel</b><span>Video · 08:30 · Caption vorbereitet</span><span class=\"publish\">Vorschau</span></div>\n          </div>\n          <div class=\"queue-row\">\n            <div class=\"thumb\"></div>\n            <div><b>Story</b><span>Bild · 09:00 · 24 Stunden sichtbar</span><span class=\"publish\">Vorschau</span></div>\n          </div>\n        </aside>\n      </section>\n\n      <section class=\"timeline\">\n        <article class=\"step\"><small>01</small><b>Onboarding</b><span>Kundendaten, Marke und Zugriff werden komplett gemacht.</span></article>\n        <article class=\"step\"><small>02</small><b>Themenplan</b><span>Formate, Uhrzeiten und Themen werden vorbereitet.</span></article>\n        <article class=\"step\"><small>03</small><b>Produktion</b><span>Karussell, Reel und Story werden erstellt und gespeichert.</span></article>\n        <article class=\"step\"><small>04</small><b>Freigabe</b><span>Der Kunde sieht Vorschau und Text vor dem Publish.</span></article>\n        <article class=\"step\"><small>05</small><b>Nachweis</b><span>Veröffentlichung, Media-ID und Status bleiben im Log.</span></article>\n      </section>\n\n      <div class=\"bottom-actions\">\n        <a class=\"button primary\" href=\"/login?next=%2Fapp\">Zum Kundenportal</a>\n        <a class=\"button\" href=\"mailto:info@hasi-elektronic.de?subject=Hasi%20Social%20Media%20Demo\">Demo besprechen</a>\n      </div>\n    </main>\n  </body>\n</html>\n";

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function textBytes(value) {
  return new TextEncoder().encode(value);
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", textBytes(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    textBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, textBytes(value));
  return base64Url(new Uint8Array(signature));
}

function readCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

async function createSession(email, env) {
  const payload = base64Url(textBytes(JSON.stringify({
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  })));
  const sig = await hmac(env.SESSION_SECRET, payload);
  return `${payload}.${sig}`;
}

async function verifySession(request, env) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  const expected = await hmac(env.SESSION_SECRET, payload);
  if (sig !== expected) return false;
  try {
    const json = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.replaceAll("-", "+").replaceAll("_", "/")), (char) => char.charCodeAt(0))));
    return json.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

async function serveAsset(env, path, request) {
  const url = new URL(request.url);
  url.pathname = path;
  return env.ASSETS.fetch(new Request(url, request));
}

async function handleLogin(request, env) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const expectedEmail = String(env.COCKPIT_EMAIL || "").trim().toLowerCase();
  const salt = env.COCKPIT_PASSWORD_SALT || "";
  const hash = await sha256Hex(`${salt}:${password}`);
  const hashMatches = env.COCKPIT_PASSWORD_HASH && hash === env.COCKPIT_PASSWORD_HASH;
  const secretMatches = env.COCKPIT_PASSWORD && password === env.COCKPIT_PASSWORD;
  if (!expectedEmail || email !== expectedEmail || (!hashMatches && !secretMatches)) {
    return json({ ok: false }, 401);
  }
  const session = await createSession(email, env);
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": `${SESSION_COOKIE}=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`,
    },
  });
}

function contentTypeOk(type, expected) {
  return String(type || "").toLowerCase().includes(expected);
}

function manifestSlug(file) {
  return String(file || "").replace(/\.manifest\.json$/, "").replace(/\.(reel|story)$/, "");
}

function safePublishFile(value) {
  return String(value || "").replace(/[^a-zA-Z0-9._-]/g, "");
}

async function activityLog(env, request) {
  const fallbackResponse = await serveAsset(env, "/data/status.json", request);
  const snapshot = fallbackResponse.ok ? await fallbackResponse.json().catch(() => ({})) : {};
  const staticLog = Array.isArray(snapshot.log) ? snapshot.log : [];
  const storedLog = env.CUSTOMERS ? await env.CUSTOMERS.get("activity-log", "json") : [];
  const combined = [...(Array.isArray(storedLog) ? storedLog : []), ...staticLog];
  const seen = new Set();
  return combined.filter((entry) => {
    const key = `${entry.action || ""}:${entry.manifest || ""}:${entry.instagramId || ""}:${entry.time || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
}

async function appendActivityLog(env, request, entry) {
  if (!env.CUSTOMERS) throw new Error("CUSTOMERS KV binding fehlt");
  const log = await activityLog(env, request);
  const next = [entry, ...log].slice(0, 100);
  await env.CUSTOMERS.put("activity-log", JSON.stringify(next, null, 2));
}

function applyPublishedLog(snapshot, log) {
  const items = Array.isArray(snapshot.manifests) ? snapshot.manifests : [];
  snapshot.manifests = items.map((item) => {
    const published = log.find((entry) => {
      if (entry.status !== "published" && !entry.instagramId) return false;
      return entry.manifest === item.file || entry.slug === item.slug || entry.slug === manifestSlug(item.file);
    });
    return published ? {
      ...item,
      published: true,
      publishedAt: published.time || item.publishedAt || "",
      instagramId: published.instagramId || item.instagramId || "",
    } : item;
  });
  snapshot.log = log.slice(0, 50);
  return snapshot;
}

async function status(env, request) {
  const response = await serveAsset(env, "/data/status.json", request);
  if (!response.ok) return json({ error: "Status snapshot not found" }, 404);
  const snapshot = await response.json();
  snapshot.customers = await customers(env, request);
  return json(applyPublishedLog(snapshot, await activityLog(env, request)));
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function parseTopics(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 12);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function boolValue(value) {
  return value === true || value === "true" || value === "on" || value === "1";
}

function normalizeOnboarding(input = {}, existing = {}) {
  return {
    profileComplete: boolValue(input.profileComplete ?? existing.profileComplete),
    brandComplete: boolValue(input.brandComplete ?? existing.brandComplete),
    productPhotos: boolValue(input.productPhotos ?? existing.productPhotos),
    productList: boolValue(input.productList ?? existing.productList),
    instagramBusiness: boolValue(input.instagramBusiness ?? existing.instagramBusiness),
    facebookPage: boolValue(input.facebookPage ?? existing.facebookPage),
    metaAccess: boolValue(input.metaAccess ?? existing.metaAccess),
    contentPlan: boolValue(input.contentPlan ?? existing.contentPlan),
    publishPermission: String(input.publishPermission || existing.publishPermission || "missing").trim(),
    notes: String(input.notes ?? existing.notes ?? "").trim(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeCadence(input = {}, existing = {}) {
  return {
    carousel: String(input.carouselTime || input.carousel || existing.carousel || "08:00").trim(),
    reel: String(input.reelTime || input.reel || existing.reel || "08:30").trim(),
    story: String(input.storyTime || input.story || existing.story || "09:00").trim(),
  };
}

function normalizeCustomer(input, existing = null) {
  const company = String(input.company || input.name || "").trim();
  if (!company) throw new Error("Firma fehlt");
  const id = slugify(existing?.id || input.id || company);
  if (!id) throw new Error("Kunden-ID fehlt");
  const onboardingInput = input.onboarding || input;
  const brandInput = input.brand || {};
  const cadenceInput = input.cadence || input;
  return {
    id,
    name: company,
    company,
    owner: String(input.owner || "").trim(),
    email: String(input.email || "").trim(),
    phone: String(input.phone || "").trim(),
    city: String(input.city || "").trim(),
    address: String(input.address || "").trim(),
    instagram: String(input.instagram || "").trim(),
    industry: String(input.industry || "").trim(),
    language: String(input.language || "de").trim(),
    status: String(input.status || "active").trim(),
    brand: {
      primary: String(input.primary || brandInput.primary || "#3ABADF").trim(),
      secondary: String(input.secondary || brandInput.secondary || input.primary || brandInput.primary || "#41AADE").trim(),
      accent: String(input.accent || brandInput.accent || "#FF6B00").trim(),
      font: String(input.font || brandInput.font || "Plus Jakarta Sans").trim(),
      logo: String(input.logo || brandInput.logo || "").trim(),
    },
    topics: parseTopics(input.topics),
    cadence: normalizeCadence(cadenceInput, existing?.cadence),
    positioning: String(input.positioning || "").trim(),
    onboarding: normalizeOnboarding(onboardingInput, existing?.onboarding),
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
}

async function fallbackCustomers(env, request) {
  const response = await serveAsset(env, "/data/customers.json", request);
  if (!response.ok) return [];
  return response.json();
}

async function customers(env, request) {
  if (env.CUSTOMERS) {
    const stored = await env.CUSTOMERS.get("customers", "json");
    if (Array.isArray(stored)) return stored.map((row) => normalizeCustomer(row, row));
  }
  const rows = await fallbackCustomers(env, request);
  return rows.map((row) => normalizeCustomer(row, row));
}

async function saveCustomers(env, rows) {
  if (!env.CUSTOMERS) throw new Error("CUSTOMERS KV binding fehlt");
  await env.CUSTOMERS.put("customers", JSON.stringify(rows, null, 2));
}

async function addCustomer(request, env) {
  const customer = normalizeCustomer(await request.json());
  const rows = await customers(env, request);
  if (rows.some((row) => row.id === customer.id)) {
    return json({ error: "Kunde existiert bereits" }, 409);
  }
  const nextRows = [customer, ...rows];
  await saveCustomers(env, nextRows);
  return json({ customer }, 201);
}

async function updateCustomer(request, env, id) {
  const input = await request.json();
  const rows = await customers(env, request);
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) return json({ error: "Kunde nicht gefunden" }, 404);
  const customer = normalizeCustomer({ ...rows[index], ...input }, rows[index]);
  const nextRows = rows.map((row, rowIndex) => rowIndex === index ? customer : row);
  await saveCustomers(env, nextRows);
  return json({ customer });
}

function graphConfig(env) {
  const igUserId = env.IG_USER_ID;
  const accessToken = env.IG_ACCESS_TOKEN;
  if (!igUserId || !accessToken) throw new Error("Instagram Cloud Secrets fehlen: IG_USER_ID / IG_ACCESS_TOKEN");
  return {
    igUserId,
    accessToken,
    version: env.GRAPH_API_VERSION || "v25.0",
    graphHost: env.IG_GRAPH_HOST || "graph.instagram.com",
  };
}

async function graphPost(env, path, params) {
  const config = graphConfig(env);
  const body = new URLSearchParams({ ...params, access_token: config.accessToken });
  const response = await fetch(`https://${config.graphHost}/${config.version}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(JSON.stringify(data.error || data));
  return data;
}

async function graphGet(env, path, params = {}) {
  const config = graphConfig(env);
  const url = new URL(`https://${config.graphHost}/${config.version}${path}`);
  url.search = new URLSearchParams({ ...params, access_token: config.accessToken }).toString();
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(JSON.stringify(data.error || data));
  return data;
}

async function waitForContainer(env, containerId, attempts = 24) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const status = await graphGet(env, `/${containerId}`, { fields: "status_code,status" });
    if (status.status_code === "FINISHED") return;
    if (status.status_code === "ERROR") throw new Error(`Container ${containerId} failed: ${status.status || "unknown error"}`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error(`Container ${containerId} wurde nicht rechtzeitig fertig.`);
}

async function findManifest(env, request, file) {
  const response = await serveAsset(env, "/data/status.json", request);
  if (!response.ok) throw new Error("Status snapshot not found");
  const snapshot = await response.json();
  return (snapshot.manifests || []).find((item) => item.file === file);
}

async function verifyPublishItem(item) {
  if (!item || !Array.isArray(item.urls) || item.urls.length === 0) throw new Error("Manifest nicht gefunden oder ohne URLs.");
  const checks = await Promise.all(item.urls.map(async (url) => {
    const response = await fetch(url, { method: "HEAD" });
    return { ok: response.ok, status: response.status, type: response.headers.get("content-type") || "" };
  }));
  if (item.type === "carousel" && !checks.every((check) => check.ok && contentTypeOk(check.type, "image/png"))) {
    throw new Error("Karussell ist nicht publish-ready: Bild-URLs liefern nicht alle image/png.");
  }
  if (item.type === "reel" && !checks.every((check) => check.ok && contentTypeOk(check.type, "video/mp4"))) {
    throw new Error("Reel ist nicht publish-ready: Video-URL liefert kein video/mp4.");
  }
}

async function publishCarousel(env, item) {
  if (item.urls.length < 2 || item.urls.length > 10) throw new Error("Instagram Karussell braucht 2 bis 10 Bilder.");
  const children = [];
  for (const imageUrl of item.urls) {
    const child = await graphPost(env, `/${graphConfig(env).igUserId}/media`, {
      image_url: imageUrl,
      is_carousel_item: "true",
    });
    await waitForContainer(env, child.id, 20);
    children.push(child.id);
  }
  const parent = await graphPost(env, `/${graphConfig(env).igUserId}/media`, {
    media_type: "CAROUSEL",
    children: children.join(","),
    caption: item.caption || "",
  });
  await waitForContainer(env, parent.id, 20);
  return graphPost(env, `/${graphConfig(env).igUserId}/media_publish`, { creation_id: parent.id });
}

async function publishReel(env, item) {
  const container = await graphPost(env, `/${graphConfig(env).igUserId}/media`, {
    media_type: "REELS",
    video_url: item.urls[0],
    caption: item.caption || "",
    share_to_feed: "true",
  });
  await waitForContainer(env, container.id, 60);
  return graphPost(env, `/${graphConfig(env).igUserId}/media_publish`, { creation_id: container.id });
}

async function publishFromCloud(request, env, type, file) {
  if (!["carousel", "reel"].includes(type)) {
    return json({ ok: false, error: "Cloud Publish v1 erlaubt nur Karussell und Reel. Story bleibt publish-ready." }, 403);
  }
  const safeFile = safePublishFile(file);
  const item = await findManifest(env, request, safeFile);
  if (!item || item.type !== type) return json({ ok: false, error: "Manifest nicht gefunden oder falscher Typ." }, 404);

  const log = await activityLog(env, request);
  const already = log.find((entry) => (entry.status === "published" || entry.instagramId) && (entry.manifest === safeFile || entry.slug === item.slug));
  if (already) {
    return json({ ok: true, skipped: true, instagramId: already.instagramId || "", message: "Schon veröffentlicht." });
  }

  try {
    await verifyPublishItem(item);
    const published = type === "carousel" ? await publishCarousel(env, item) : await publishReel(env, item);
    const entry = {
      time: new Date().toISOString(),
      action: `publish-${type}`,
      status: "published",
      type,
      topic: item.slug || manifestSlug(safeFile),
      slug: item.slug || manifestSlug(safeFile),
      manifest: safeFile,
      instagramId: published.id || "",
      note: "Cloud Publish v1 über Hasi Social Media.",
    };
    await appendActivityLog(env, request, entry);
    return json({ ok: true, instagramId: published.id || "", entry });
  } catch (error) {
    await appendActivityLog(env, request, {
      time: new Date().toISOString(),
      action: `publish-${type}`,
      status: "failed",
      type,
      topic: item.slug || manifestSlug(safeFile),
      slug: item.slug || manifestSlug(safeFile),
      manifest: safeFile,
      instagramId: "",
      note: String(error.message || error).slice(0, 500),
    }).catch(() => {});
    return json({ ok: false, error: String(error.message || error) }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/home") {
      return new Response(HOME_HTML, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }
    if (url.pathname === "/demo" || url.pathname === "/demo.html") {
      return new Response(DEMO_HTML, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }
    if (url.pathname === "/login" || url.pathname === "/login.html") {
      return new Response(LOGIN_HTML, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Set-Cookie": clearSessionCookie(),
        },
      });
    }
    if (url.pathname === "/api/login" && request.method === "POST") {
      return handleLogin(request, env);
    }
    if (url.pathname === "/hasi-logo.png") {
      return serveAsset(env, "/hasi-logo.png", request);
    }
    if (url.pathname === "/logout") {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/login",
          "Set-Cookie": clearSessionCookie(),
        },
      });
    }

    if (!(await verifySession(request, env))) {
      if (url.pathname.startsWith("/api/")) return json({ error: "Unauthorized" }, 401);
      const next = `${url.pathname}${url.search}`;
      return Response.redirect(`${url.origin}/login?next=${encodeURIComponent(next)}`, 302);
    }

    if (url.pathname === "/admin" || url.pathname === "/admin.html") {
      return new Response(ADMIN_HTML, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    if (url.pathname === "/app" || url.pathname === "/app.html") return serveAsset(env, "/index.html", request);
    if (url.pathname.startsWith("/kunde/")) return serveAsset(env, "/index.html", request);
    if (url.pathname === "/api/status") return status(env, request);
    if (url.pathname === "/api/customers" && request.method === "GET") {
      return json({ customers: await customers(env, request) });
    }
    if (url.pathname === "/api/customers" && request.method === "POST") {
      return addCustomer(request, env);
    }
    if (url.pathname.startsWith("/api/customers/") && request.method === "PUT") {
      const id = decodeURIComponent(url.pathname.replace("/api/customers/", ""));
      return updateCustomer(request, env, id);
    }
    if (url.pathname.startsWith("/api/publish/") && request.method === "POST") {
      const [, , , type, ...fileParts] = url.pathname.split("/");
      return publishFromCloud(request, env, type, decodeURIComponent(fileParts.join("/") || ""));
    }
    return env.ASSETS.fetch(request);
  },
};
