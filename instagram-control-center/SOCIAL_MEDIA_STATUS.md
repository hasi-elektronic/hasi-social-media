# Hasi Social Media Status

Stand: 2026-07-08, Europe/Berlin

## Neue Ausrichtung

Hasi Social Media wird stärker auf Web-Apps, iOS Apps, Android Apps, Automatisierung und digitale Lösungen für lokale Firmen ausgerichtet.

## Morgenroutine

| Uhrzeit | Inhalt | Status |
|---|---|---|
| 06:30 | Tagesproduktion | vier Inhalte vorbereiten, nicht veröffentlichen |
| laut Wochenplan | Morgen-Story | automatisch veröffentlichen |
| laut Wochenplan | Karussell | automatisch veröffentlichen |
| laut Wochenplan | Reel | automatisch veröffentlichen |
| Reel + 15 Minuten | Teaser-Story | automatisch veröffentlichen |

## Heute

| Kanal | Status | Thema | Slug | Instagram ID |
|---|---|---|---|---|
| Karussell | veröffentlicht | Hasi Safe Stick | `hasi-safe-stick-2026-07-08` | `18060291389739396` |
| Karussell | veröffentlicht | PC-Reparatur | `pc-reparatur-2026-07-08` | `17979586548058524` |
| Morgen-Story | aktiviert | laut Wochenplan | - | - |
| Reel | aktiviert | laut Wochenplan | - | - |
| Teaser-Story | aktiviert | Reel + 15 Minuten | - | - |

## Automationen

| Automation | Status | Zeit | Workspace |
|---|---|---|---|
| Hasi Social Media Tagesproduktion | ACTIVE | täglich 06:30 | `/Users/hguencavdi/Desktop/hasi-social-media` |
| Hasi Social Media Produktionskontrolle | ACTIVE | täglich 07:15 | `/Users/hguencavdi/Desktop/hasi-social-media` |
| Hasi Social Media Publish Dispatcher | ACTIVE | alle 15 Minuten | `/Users/hguencavdi/Desktop/hasi-social-media` |
| Hasi Social Media Tagesabschluss | ACTIVE | täglich 20:45 | `/Users/hguencavdi/Desktop/hasi-social-media` |

## So siehst du es selbst

Starte das lokale Control Center:

```bash
cd /Users/hguencavdi/Desktop/hasi-social-media/instagram-control-center
npm start
```

Dann Browser öffnen:

```text
http://localhost:8787
```

Dort siehst du:

- Instagram API Status
- Publish-ready Manifeste
- Carousel/Reel/Story Dateien
- URL Checks gegen Cloudflare R2
- Publish-Logs
- Automationsstatus

## Wichtige Regel

Nicht jeden fertigen Inhalt sofort erneut publishen. Bei Story/Reel/Carousel immer zuerst im Control Center oder in dieser Statusdatei prüfen, ob der Slug schon eine Instagram ID hat.
