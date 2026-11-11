import { NOTIFY } from './config'

/** Link açılınca Umut'a bildirim (ntfy). Oturumda bir kez. */
export function notifyLinkOpened() {
  try {
    const key = 'surpriz_notify_open'
    if (sessionStorage.getItem(key) === '1') return
    sessionStorage.setItem(key, '1')
  } catch {
    // sessionStorage yoksa yine de dene
  }

  const when = new Date().toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
  })

  void fetch(`https://ntfy.sh/${NOTIFY.topic}`, {
    method: 'POST',
    headers: {
      Title: 'Sürpriz linki açıldı',
      Priority: 'high',
      Tags: 'tada,eyes',
    },
    body: `Doğum günü sürprizi açıldı · ${when} (İstanbul)`,
  }).catch(() => {
    // Bildirim olmasa oyun devam etsin
  })
}

/** Ödül/mesaj ekranına gelince ikinci haber. */
export function notifyReachedMessage() {
  try {
    const key = 'surpriz_notify_message'
    if (sessionStorage.getItem(key) === '1') return
    sessionStorage.setItem(key, '1')
  } catch {
    /* ignore */
  }

  void fetch(`https://ntfy.sh/${NOTIFY.topic}`, {
    method: 'POST',
    headers: {
      Title: 'Mesaja ulaştı!',
      Priority: 'urgent',
      Tags: 'heart,partying_face',
    },
    body: 'Ödül ekranına / doğum günü mesajına geldi 💜',
  }).catch(() => {})
}
