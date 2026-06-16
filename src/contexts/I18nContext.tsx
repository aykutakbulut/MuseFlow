"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// ── Dictionaries ───────────────────────────────────────────────────────────

export const dictionaries = {
  en: {
    "pwa.installBannerTitle": "Install MuseFlow",
    "pwa.installBannerDesc": "Install our app on your device for a better experience.",
    "pwa.installButton": "Install",
    "pwa.close": "Close",
    "pwa.installApp": "Install App",
    "mood.goodNight": "Good Night", "mood.goodMorning": "Good Morning", "mood.goodAfternoon": "Good Afternoon", "mood.goodEvening": "Good Evening",
    "nav.home": "Home", "nav.explore": "Explore", "nav.library": "Library",
    "search.title": "What do you want to listen to?", "search.placeholder": "Search songs, artists, or albums...", "search.hint": "Type at least 2 characters. Results update automatically.", "search.description": "Search the unlimited music catalog, add results to your list and listen uninterrupted.",
    "home.recentlyPlayed": "Recently Played", "home.emptyRecentlyPlayed": "You haven't listened to any music yet. Start exploring!", "home.madeForYou": "Made For You", "home.emptyMadeForYou": "Listen to some music so we can provide personalized recommendations.", "home.favorites": "Your Favorites", "home.results": "results", "home.noResults": "No results found", "home.noResultsDesc": "Try again with different keywords.", "home.somethingWentWrong": "Something went wrong.", "home.yourLibrary": "Your Library", "home.newList": "New List", "home.playlists": "Playlists", "home.noPlaylists": "You don't have any lists yet.", "home.createFirstPlaylist": "Create your first list", "home.songs": "songs", "home.song": "song", "home.likedSongs": "Liked Songs", "home.noFavorites": "You don't have any favorite songs yet.", "home.cleanHistory": "Your history is clean.", "home.addToPlaylist": "Add to List", "home.newPlaylistName": "New list name...", "home.promptNewListName": "New list name:",
    "track.back": "Back", "track.play": "Play", "track.addToQueue": "+ Add to Queue", "track.inFavorites": "In Favorites", "track.addToFavorites": "Add to Favorites", "track.addToList": "Add to List", "track.downloaded": "Downloaded", "track.download": "Download (in-app)", "track.description": "Description", "track.relatedSongs": "Related Songs", "track.noRelatedSongs": "No related songs found.", "track.noPlaylistYet": "No list yet. You can create a new list from the home page.", "track.close": "Close", "track.videoFailed": "Failed to load video", "track.unknownError": "Unknown error", "track.views": "views", "track.likes": "likes",
    "playlist.deleteList": "Delete List", "playlist.renameList": "Rename", "playlist.emptyPlaylist": "This list is empty.", "playlist.addSongsFromExplore": "You can add songs to this list from the Explore tab.", "playlist.remove": "Remove", "playlist.playAll": "Play All", "playlist.shufflePlay": "Shuffle & Play", "playlist.save": "Save", "playlist.cancel": "Cancel", "playlist.delete": "Delete", "playlist.deleteWarning": "list will be permanently deleted. This cannot be undone.",
    "player.audio": "Audio", "player.video": "Video", "player.upNext": "Up Next", "player.clearQueue": "Clear Queue", "player.close": "Close",
  },
  tr: {
    "pwa.installBannerTitle": "Uygulamayı İndir",
    "pwa.installBannerDesc": "Daha iyi bir müzik deneyimi için uygulamamızı cihazınıza yükleyin.",
    "pwa.installButton": "İndir",
    "pwa.close": "Kapat",
    "pwa.installApp": "Uygulamayı İndir",
    "mood.goodNight": "İyi Geceler", "mood.goodMorning": "Günaydın", "mood.goodAfternoon": "İyi Günler", "mood.goodEvening": "İyi Akşamlar",
    "nav.home": "Ana Sayfa", "nav.explore": "Keşfet", "nav.library": "Kitaplık",
    "search.title": "Ne dinlemek istersin?", "search.placeholder": "Şarkı, sanatçı veya albüm ara...", "search.hint": "En az 2 karakter yaz. Sonuçlar otomatik güncellenir.", "search.description": "Sınırsız müzik kataloğunda arama yap, sonuçları listene ekle ve kesintisiz dinle.",
    "home.recentlyPlayed": "Son Dinlenenler", "home.emptyRecentlyPlayed": "Henüz müzik dinlemedin. Keşfetmeye başla!", "home.madeForYou": "Senin İçin Seçtiklerimiz", "home.emptyMadeForYou": "Sana özel öneriler sunabilmemiz için biraz müzik dinlemelisin.", "home.favorites": "Favorilerin", "home.results": "sonuç", "home.noResults": "Sonuç bulunamadı", "home.noResultsDesc": "Farklı anahtar kelimeler ile tekrar denemelisin.", "home.somethingWentWrong": "Bir şeyler ters gitti.", "home.yourLibrary": "Kitaplığın", "home.newList": "Yeni Liste", "home.playlists": "Oynatma Listeleri", "home.noPlaylists": "Henüz listen yok.", "home.createFirstPlaylist": "İlk listeni oluştur", "home.songs": "şarkı", "home.song": "şarkı", "home.likedSongs": "Beğendiklerin", "home.noFavorites": "Henüz favori şarkın yok.", "home.cleanHistory": "Geçmişin temiz.", "home.addToPlaylist": "Listeye Ekle", "home.newPlaylistName": "Yeni liste adı...", "home.promptNewListName": "Yeni liste adı:",
    "track.back": "Geri", "track.play": "Çal", "track.addToQueue": "+ Sıraya Ekle", "track.inFavorites": "Favorilerimde", "track.addToFavorites": "Favorilere Ekle", "track.addToList": "Listeye Ekle", "track.downloaded": "İndirildi", "track.download": "İndir (uygulama içi)", "track.description": "Açıklama", "track.relatedSongs": "İlgili Şarkılar", "track.noRelatedSongs": "İlgili şarkı bulunamadı.", "track.noPlaylistYet": "Henüz liste yok. Ana sayfadan yeni liste oluşturabilirsin.", "track.close": "Kapat", "track.videoFailed": "Video yüklenemedi", "track.unknownError": "Bilinmeyen hata", "track.views": "görüntülenme", "track.likes": "beğeni",
    "playlist.deleteList": "Listeyi Sil", "playlist.renameList": "Yeniden Adlandır", "playlist.emptyPlaylist": "Bu liste henüz boş.", "playlist.addSongsFromExplore": "Keşfet sekmesinden bu listeye şarkı ekleyebilirsin.", "playlist.remove": "Kaldır", "playlist.playAll": "Tümünü Çal", "playlist.shufflePlay": "Karıştır ve Çal", "playlist.save": "Kaydet", "playlist.cancel": "İptal", "playlist.delete": "Sil", "playlist.deleteWarning": "listesi kalıcı olarak silinecek. Bu işlem geri alınamaz.",
    "player.audio": "Ses", "player.video": "Video", "player.upNext": "Sıradaki", "player.clearQueue": "Sırayı Temizle", "player.close": "Kapat",
  },
  de: {
    "pwa.installBannerTitle": "App installieren",
    "pwa.installBannerDesc": "Installieren Sie unsere App für ein besseres Erlebnis.",
    "pwa.installButton": "Installieren",
    "pwa.close": "Schließen",
    "pwa.installApp": "App installieren",
    "mood.goodNight": "Gute Nacht", "mood.goodMorning": "Guten Morgen", "mood.goodAfternoon": "Guten Tag", "mood.goodEvening": "Guten Abend",
    "nav.home": "Startseite", "nav.explore": "Entdecken", "nav.library": "Bibliothek",
    "search.title": "Was möchtest du hören?", "search.placeholder": "Suche nach Songs, Künstlern...", "search.hint": "Mindestens 2 Zeichen eingeben. Ergebnisse aktualisieren sich automatisch.", "search.description": "Suche im unbegrenzten Musikkatalog, füge Ergebnisse zu deiner Liste hinzu.",
    "home.recentlyPlayed": "Zuletzt gehört", "home.emptyRecentlyPlayed": "Du hast noch keine Musik gehört.", "home.madeForYou": "Für dich erstellt", "home.emptyMadeForYou": "Höre Musik für personalisierte Empfehlungen.", "home.favorites": "Deine Favoriten", "home.results": "Ergebnisse", "home.noResults": "Keine Ergebnisse", "home.noResultsDesc": "Versuche es mit anderen Stichwörtern.", "home.somethingWentWrong": "Etwas ist schief gelaufen.", "home.yourLibrary": "Deine Bibliothek", "home.newList": "Neue Liste", "home.playlists": "Playlists", "home.noPlaylists": "Du hast noch keine Listen.", "home.createFirstPlaylist": "Erstelle deine erste Liste", "home.songs": "Songs", "home.song": "Song", "home.likedSongs": "Lieblingssongs", "home.noFavorites": "Du hast noch keine Lieblingssongs.", "home.cleanHistory": "Dein Verlauf ist leer.", "home.addToPlaylist": "Zur Liste hinzufügen", "home.newPlaylistName": "Neuer Listenname...", "home.promptNewListName": "Neuer Listenname:",
    "track.back": "Zurück", "track.play": "Abspielen", "track.addToQueue": "+ Zur Warteschlange", "track.inFavorites": "In Favoriten", "track.addToFavorites": "Zu Favoriten", "track.addToList": "Zur Liste", "track.downloaded": "Heruntergeladen", "track.download": "Herunterladen", "track.description": "Beschreibung", "track.relatedSongs": "Ähnliche Songs", "track.noRelatedSongs": "Keine ähnlichen Songs gefunden.", "track.noPlaylistYet": "Noch keine Liste.", "track.close": "Schließen", "track.videoFailed": "Video konnte nicht geladen werden", "track.unknownError": "Unbekannter Fehler", "track.views": "Aufrufe", "track.likes": "Gefällt mir",
    "playlist.deleteList": "Liste löschen", "playlist.renameList": "Umbenennen", "playlist.emptyPlaylist": "Diese Liste ist leer.", "playlist.addSongsFromExplore": "Du kannst dieser Liste Songs hinzufügen.", "playlist.remove": "Entfernen", "playlist.playAll": "Alle abspielen", "playlist.shufflePlay": "Zufällig abspielen", "playlist.save": "Speichern", "playlist.cancel": "Abbrechen", "playlist.delete": "Löschen", "playlist.deleteWarning": "wird dauerhaft gelöscht.",
    "player.audio": "Audio", "player.video": "Video", "player.upNext": "Als nächstes", "player.clearQueue": "Warteschlange leeren", "player.close": "Schließen",
  },
  fr: {
    "pwa.installBannerTitle": "Installer l'application",
    "pwa.installBannerDesc": "Installez notre application pour une meilleure expérience.",
    "pwa.installButton": "Installer",
    "pwa.close": "Fermer",
    "pwa.installApp": "Installer l'app",
    "mood.goodNight": "Bonne Nuit", "mood.goodMorning": "Bonjour", "mood.goodAfternoon": "Bon Après-midi", "mood.goodEvening": "Bonsoir",
    "nav.home": "Accueil", "nav.explore": "Explorer", "nav.library": "Bibliothèque",
    "search.title": "Que voulez-vous écouter ?", "search.placeholder": "Rechercher des chansons...", "search.hint": "Tapez au moins 2 caractères.", "search.description": "Recherchez dans le catalogue de musique illimité.",
    "home.recentlyPlayed": "Écouté récemment", "home.emptyRecentlyPlayed": "Vous n'avez pas encore écouté de musique.", "home.madeForYou": "Fait pour vous", "home.emptyMadeForYou": "Écoutez de la musique pour des recommandations.", "home.favorites": "Vos favoris", "home.results": "résultats", "home.noResults": "Aucun résultat", "home.noResultsDesc": "Réessayez avec des mots-clés différents.", "home.somethingWentWrong": "Un problème est survenu.", "home.yourLibrary": "Votre Bibliothèque", "home.newList": "Nouvelle liste", "home.playlists": "Playlists", "home.noPlaylists": "Vous n'avez pas encore de listes.", "home.createFirstPlaylist": "Créez votre première liste", "home.songs": "chansons", "home.song": "chanson", "home.likedSongs": "Titres aimés", "home.noFavorites": "Vous n'avez pas encore de chansons favorites.", "home.cleanHistory": "Votre historique est vide.", "home.addToPlaylist": "Ajouter à la liste", "home.newPlaylistName": "Nom de la liste...", "home.promptNewListName": "Nom de la liste :",
    "track.back": "Retour", "track.play": "Lire", "track.addToQueue": "+ À la file", "track.inFavorites": "Dans les favoris", "track.addToFavorites": "Aux favoris", "track.addToList": "À la liste", "track.downloaded": "Téléchargé", "track.download": "Télécharger", "track.description": "Description", "track.relatedSongs": "Titres similaires", "track.noRelatedSongs": "Aucun titre similaire.", "track.noPlaylistYet": "Pas encore de liste.", "track.close": "Fermer", "track.videoFailed": "Échec du chargement de la vidéo", "track.unknownError": "Erreur inconnue", "track.views": "vues", "track.likes": "j'aime",
    "playlist.deleteList": "Supprimer la liste", "playlist.renameList": "Renommer", "playlist.emptyPlaylist": "Cette liste est vide.", "playlist.addSongsFromExplore": "Ajoutez des titres à cette liste.", "playlist.remove": "Retirer", "playlist.playAll": "Tout lire", "playlist.shufflePlay": "Aléatoire", "playlist.save": "Enregistrer", "playlist.cancel": "Annuler", "playlist.delete": "Supprimer", "playlist.deleteWarning": "sera supprimée définitivement.",
    "player.audio": "Audio", "player.video": "Vidéo", "player.upNext": "À suivre", "player.clearQueue": "Vider la file", "player.close": "Fermer",
  },
  ru: {
    "pwa.installBannerTitle": "Установить приложение",
    "pwa.installBannerDesc": "Установите наше приложение для лучшего опыта.",
    "pwa.installButton": "Установить",
    "pwa.close": "Закрыть",
    "pwa.installApp": "Установить приложение",
    "mood.goodNight": "Спокойной ночи", "mood.goodMorning": "Доброе утро", "mood.goodAfternoon": "Добрый день", "mood.goodEvening": "Добрый вечер",
    "nav.home": "Главная", "nav.explore": "Обзор", "nav.library": "Медиатека",
    "search.title": "Что вы хотите послушать?", "search.placeholder": "Поиск песен...", "search.hint": "Введите хотя бы 2 символа.", "search.description": "Ищите в безграничном каталоге музыки.",
    "home.recentlyPlayed": "Недавно", "home.emptyRecentlyPlayed": "Вы еще ничего не слушали.", "home.madeForYou": "Для вас", "home.emptyMadeForYou": "Послушайте немного музыки.", "home.favorites": "Избранное", "home.results": "результатов", "home.noResults": "Ничего не найдено", "home.noResultsDesc": "Попробуйте другие слова.", "home.somethingWentWrong": "Что-то пошло не так.", "home.yourLibrary": "Ваша медиатека", "home.newList": "Новый плейлист", "home.playlists": "Плейлисты", "home.noPlaylists": "У вас пока нет плейлистов.", "home.createFirstPlaylist": "Создайте первый плейлист", "home.songs": "песен", "home.song": "песня", "home.likedSongs": "Любимые", "home.noFavorites": "Нет любимых треков.", "home.cleanHistory": "История пуста.", "home.addToPlaylist": "Добавить в плейлист", "home.newPlaylistName": "Имя плейлиста...", "home.promptNewListName": "Имя плейлиста:",
    "track.back": "Назад", "track.play": "Слушать", "track.addToQueue": "+ В очередь", "track.inFavorites": "В избранном", "track.addToFavorites": "В избранное", "track.addToList": "В список", "track.downloaded": "Загружено", "track.download": "Скачать", "track.description": "Описание", "track.relatedSongs": "Похожие", "track.noRelatedSongs": "Похожие треки не найдены.", "track.noPlaylistYet": "Пока нет плейлистов.", "track.close": "Закрыть", "track.videoFailed": "Ошибка видео", "track.unknownError": "Неизвестная ошибка", "track.views": "просмотров", "track.likes": "лайков",
    "playlist.deleteList": "Удалить плейлист", "playlist.renameList": "Переименовать", "playlist.emptyPlaylist": "Список пуст.", "playlist.addSongsFromExplore": "Добавьте треки из раздела Обзор.", "playlist.remove": "Удалить", "playlist.playAll": "Слушать все", "playlist.shufflePlay": "Вперемешку", "playlist.save": "Сохранить", "playlist.cancel": "Отмена", "playlist.delete": "Удалить", "playlist.deleteWarning": "будет удален навсегда.",
    "player.audio": "Аудио", "player.video": "Видео", "player.upNext": "Далее", "player.clearQueue": "Очистить очередь", "player.close": "Закрыть",
  },
  es: {
    "pwa.installBannerTitle": "Instalar aplicación",
    "pwa.installBannerDesc": "Instala nuestra aplicación para una mejor experiencia.",
    "pwa.installButton": "Instalar",
    "pwa.close": "Cerrar",
    "pwa.installApp": "Instalar App",
    "mood.goodNight": "Buenas Noches", "mood.goodMorning": "Buenos Días", "mood.goodAfternoon": "Buenas Tardes", "mood.goodEvening": "Buenas Tardes",
    "nav.home": "Inicio", "nav.explore": "Explorar", "nav.library": "Biblioteca",
    "search.title": "¿Qué quieres escuchar?", "search.placeholder": "Buscar canciones...", "search.hint": "Escribe al menos 2 caracteres.", "search.description": "Busca en el catálogo de música ilimitado.",
    "home.recentlyPlayed": "Recientes", "home.emptyRecentlyPlayed": "Aún no has escuchado música.", "home.madeForYou": "Hecho Para Ti", "home.emptyMadeForYou": "Escucha algo de música para recomendarte.", "home.favorites": "Tus Favoritos", "home.results": "resultados", "home.noResults": "Sin resultados", "home.noResultsDesc": "Intenta con otras palabras.", "home.somethingWentWrong": "Algo salió mal.", "home.yourLibrary": "Tu Biblioteca", "home.newList": "Nueva Lista", "home.playlists": "Listas", "home.noPlaylists": "Aún no tienes listas.", "home.createFirstPlaylist": "Crea tu primera lista", "home.songs": "canciones", "home.song": "canción", "home.likedSongs": "Canciones que te gustan", "home.noFavorites": "No tienes canciones favoritas.", "home.cleanHistory": "Tu historial está limpio.", "home.addToPlaylist": "Añadir a la lista", "home.newPlaylistName": "Nombre de la lista...", "home.promptNewListName": "Nombre de la lista:",
    "track.back": "Atrás", "track.play": "Reproducir", "track.addToQueue": "+ A la cola", "track.inFavorites": "En Favoritos", "track.addToFavorites": "A Favoritos", "track.addToList": "A la lista", "track.downloaded": "Descargado", "track.download": "Descargar", "track.description": "Descripción", "track.relatedSongs": "Relacionadas", "track.noRelatedSongs": "No se encontraron relacionadas.", "track.noPlaylistYet": "Sin listas aún.", "track.close": "Cerrar", "track.videoFailed": "Error al cargar", "track.unknownError": "Error desconocido", "track.views": "vistas", "track.likes": "me gusta",
    "playlist.deleteList": "Eliminar lista", "playlist.renameList": "Renombrar", "playlist.emptyPlaylist": "Lista vacía.", "playlist.addSongsFromExplore": "Añade canciones desde Explorar.", "playlist.remove": "Quitar", "playlist.playAll": "Reproducir todo", "playlist.shufflePlay": "Aleatorio", "playlist.save": "Guardar", "playlist.cancel": "Cancelar", "playlist.delete": "Eliminar", "playlist.deleteWarning": "se eliminará permanentemente.",
    "player.audio": "Audio", "player.video": "Video", "player.upNext": "A continuación", "player.clearQueue": "Limpiar cola", "player.close": "Cerrar",
  },
  it: {
    "pwa.installBannerTitle": "Installa app",
    "pwa.installBannerDesc": "Installa la nostra app per una migliore esperienza.",
    "pwa.installButton": "Installa",
    "pwa.close": "Chiudi",
    "pwa.installApp": "Installa App",
    "mood.goodNight": "Buonanotte", "mood.goodMorning": "Buongiorno", "mood.goodAfternoon": "Buon Pomeriggio", "mood.goodEvening": "Buonasera",
    "nav.home": "Home", "nav.explore": "Esplora", "nav.library": "Libreria",
    "search.title": "Cosa vuoi ascoltare?", "search.placeholder": "Cerca canzoni...", "search.hint": "Digita almeno 2 caratteri.", "search.description": "Cerca nel catalogo musicale illimitato.",
    "home.recentlyPlayed": "Riprodotti di recente", "home.emptyRecentlyPlayed": "Non hai ancora ascoltato nulla.", "home.madeForYou": "Creato per te", "home.emptyMadeForYou": "Ascolta un po' di musica.", "home.favorites": "I tuoi preferiti", "home.results": "risultati", "home.noResults": "Nessun risultato", "home.noResultsDesc": "Riprova con altre parole chiave.", "home.somethingWentWrong": "Qualcosa è andato storto.", "home.yourLibrary": "La tua Libreria", "home.newList": "Nuova Lista", "home.playlists": "Playlist", "home.noPlaylists": "Non hai ancora liste.", "home.createFirstPlaylist": "Crea la tua prima lista", "home.songs": "canzoni", "home.song": "canzone", "home.likedSongs": "Brani che ti piacciono", "home.noFavorites": "Non hai ancora canzoni preferite.", "home.cleanHistory": "La tua cronologia è pulita.", "home.addToPlaylist": "Aggiungi alla lista", "home.newPlaylistName": "Nome della lista...", "home.promptNewListName": "Nome della lista:",
    "track.back": "Indietro", "track.play": "Riproduci", "track.addToQueue": "+ In coda", "track.inFavorites": "Nei preferiti", "track.addToFavorites": "Aggiungi ai preferiti", "track.addToList": "Aggiungi alla lista", "track.downloaded": "Scaricato", "track.download": "Scarica", "track.description": "Descrizione", "track.relatedSongs": "Brani simili", "track.noRelatedSongs": "Nessun brano simile trovato.", "track.noPlaylistYet": "Ancora nessuna lista.", "track.close": "Chiudi", "track.videoFailed": "Impossibile caricare il video", "track.unknownError": "Errore sconosciuto", "track.views": "visualizzazioni", "track.likes": "mi piace",
    "playlist.deleteList": "Elimina Lista", "playlist.renameList": "Rinomina", "playlist.emptyPlaylist": "Questa lista è vuota.", "playlist.addSongsFromExplore": "Aggiungi brani da Esplora.", "playlist.remove": "Rimuovi", "playlist.playAll": "Riproduci tutto", "playlist.shufflePlay": "Riproduzione casuale", "playlist.save": "Salva", "playlist.cancel": "Annulla", "playlist.delete": "Elimina", "playlist.deleteWarning": "sarà eliminata definitivamente.",
    "player.audio": "Audio", "player.video": "Video", "player.upNext": "In coda", "player.clearQueue": "Svuota coda", "player.close": "Chiudi",
  },
  pt: {
    "pwa.installBannerTitle": "Instalar aplicativo",
    "pwa.installBannerDesc": "Instale nosso aplicativo para uma melhor experiência.",
    "pwa.installButton": "Instalar",
    "pwa.close": "Fechar",
    "pwa.installApp": "Instalar App",
    "mood.goodNight": "Boa Noite", "mood.goodMorning": "Bom Dia", "mood.goodAfternoon": "Boa Tarde", "mood.goodEvening": "Boa Noite",
    "nav.home": "Início", "nav.explore": "Explorar", "nav.library": "Biblioteca",
    "search.title": "O que você quer ouvir?", "search.placeholder": "Buscar músicas...", "search.hint": "Digite pelo menos 2 caracteres.", "search.description": "Busque no catálogo de música ilimitado.",
    "home.recentlyPlayed": "Tocadas Recentemente", "home.emptyRecentlyPlayed": "Você ainda não ouviu nada.", "home.madeForYou": "Feito Para Você", "home.emptyMadeForYou": "Ouça um pouco de música.", "home.favorites": "Seus Favoritos", "home.results": "resultados", "home.noResults": "Sem resultados", "home.noResultsDesc": "Tente com outras palavras.", "home.somethingWentWrong": "Algo deu errado.", "home.yourLibrary": "Sua Biblioteca", "home.newList": "Nova Lista", "home.playlists": "Playlists", "home.noPlaylists": "Você não tem listas ainda.", "home.createFirstPlaylist": "Crie sua primeira lista", "home.songs": "músicas", "home.song": "música", "home.likedSongs": "Músicas Curtidas", "home.noFavorites": "Você não tem músicas favoritas.", "home.cleanHistory": "Seu histórico está limpo.", "home.addToPlaylist": "Adicionar à lista", "home.newPlaylistName": "Nome da lista...", "home.promptNewListName": "Nome da lista:",
    "track.back": "Voltar", "track.play": "Tocar", "track.addToQueue": "+ Na Fila", "track.inFavorites": "Nos Favoritos", "track.addToFavorites": "Aos Favoritos", "track.addToList": "Para a Lista", "track.downloaded": "Baixado", "track.download": "Baixar", "track.description": "Descrição", "track.relatedSongs": "Músicas Relacionadas", "track.noRelatedSongs": "Nenhuma música relacionada.", "track.noPlaylistYet": "Nenhuma lista ainda.", "track.close": "Fechar", "track.videoFailed": "Falha ao carregar", "track.unknownError": "Erro desconhecido", "track.views": "visualizações", "track.likes": "curtidas",
    "playlist.deleteList": "Apagar Lista", "playlist.renameList": "Renomear", "playlist.emptyPlaylist": "Esta lista está vazia.", "playlist.addSongsFromExplore": "Adicione músicas pelo Explorar.", "playlist.remove": "Remover", "playlist.playAll": "Tocar tudo", "playlist.shufflePlay": "Ordem Aleatória", "playlist.save": "Salvar", "playlist.cancel": "Cancelar", "playlist.delete": "Apagar", "playlist.deleteWarning": "será apagada permanentemente.",
    "player.audio": "Áudio", "player.video": "Vídeo", "player.upNext": "A seguir", "player.clearQueue": "Limpar fila", "player.close": "Fechar",
  },
  ja: {
    "pwa.installBannerTitle": "アプリをインストール",
    "pwa.installBannerDesc": "より良い体験のためにアプリをインストールしてください。",
    "pwa.installButton": "インストール",
    "pwa.close": "閉じる",
    "pwa.installApp": "アプリをインストール",
    "mood.goodNight": "おやすみなさい", "mood.goodMorning": "おはようございます", "mood.goodAfternoon": "こんにちは", "mood.goodEvening": "こんばんは",
    "nav.home": "ホーム", "nav.explore": "検索", "nav.library": "ライブラリ",
    "search.title": "何を聴きたいですか？", "search.placeholder": "曲、アーティストを検索...", "search.hint": "2文字以上入力してください。", "search.description": "無制限の音楽カタログで検索します。",
    "home.recentlyPlayed": "最近再生した曲", "home.emptyRecentlyPlayed": "まだ音楽を再生していません。", "home.madeForYou": "あなたへのおすすめ", "home.emptyMadeForYou": "音楽を聴いておすすめを受け取りましょう。", "home.favorites": "お気に入り", "home.results": "件の結果", "home.noResults": "結果がありません", "home.noResultsDesc": "別のキーワードをお試しください。", "home.somethingWentWrong": "エラーが発生しました。", "home.yourLibrary": "マイライブラリ", "home.newList": "新しいリスト", "home.playlists": "プレイリスト", "home.noPlaylists": "リストがありません。", "home.createFirstPlaylist": "最初のリストを作成", "home.songs": "曲", "home.song": "曲", "home.likedSongs": "お気に入りの曲", "home.noFavorites": "お気に入りの曲がありません。", "home.cleanHistory": "履歴はありません。", "home.addToPlaylist": "リストに追加", "home.newPlaylistName": "リスト名...", "home.promptNewListName": "リスト名：",
    "track.back": "戻る", "track.play": "再生", "track.addToQueue": "+ キューに追加", "track.inFavorites": "お気に入り済み", "track.addToFavorites": "お気に入りに追加", "track.addToList": "リストに追加", "track.downloaded": "ダウンロード済み", "track.download": "ダウンロード", "track.description": "説明", "track.relatedSongs": "関連する曲", "track.noRelatedSongs": "関連する曲はありません。", "track.noPlaylistYet": "リストがありません。", "track.close": "閉じる", "track.videoFailed": "動画の読み込みに失敗しました", "track.unknownError": "不明なエラー", "track.views": "回視聴", "track.likes": "高評価",
    "playlist.deleteList": "リストを削除", "playlist.renameList": "名前を変更", "playlist.emptyPlaylist": "このリストは空です。", "playlist.addSongsFromExplore": "検索タブから追加できます。", "playlist.remove": "削除", "playlist.playAll": "すべて再生", "playlist.shufflePlay": "シャッフル再生", "playlist.save": "保存", "playlist.cancel": "キャンセル", "playlist.delete": "削除", "playlist.deleteWarning": "は完全に削除されます。",
    "player.audio": "オーディオ", "player.video": "動画", "player.upNext": "次に再生", "player.clearQueue": "キューをクリア", "player.close": "閉じる",
  },
  zh: {
    "pwa.installBannerTitle": "安装应用",
    "pwa.installBannerDesc": "安装我们的应用以获得更好的体验。",
    "pwa.installButton": "安装",
    "pwa.close": "关闭",
    "pwa.installApp": "安装应用",
    "mood.goodNight": "晚安", "mood.goodMorning": "早上好", "mood.goodAfternoon": "下午好", "mood.goodEvening": "晚上好",
    "nav.home": "首页", "nav.explore": "探索", "nav.library": "音乐库",
    "search.title": "你想听什么？", "search.placeholder": "搜索歌曲、歌手...", "search.hint": "至少输入 2 个字符。", "search.description": "在无限的音乐目录中搜索。",
    "home.recentlyPlayed": "最近播放", "home.emptyRecentlyPlayed": "你还没有听过任何音乐。", "home.madeForYou": "为你推荐", "home.emptyMadeForYou": "多听听音乐以获取推荐。", "home.favorites": "你的最爱", "home.results": "个结果", "home.noResults": "未找到结果", "home.noResultsDesc": "请尝试其他关键字。", "home.somethingWentWrong": "发生错误。", "home.yourLibrary": "你的音乐库", "home.newList": "新歌单", "home.playlists": "歌单", "home.noPlaylists": "你还没有歌单。", "home.createFirstPlaylist": "创建你的第一个歌单", "home.songs": "首歌", "home.song": "首歌", "home.likedSongs": "喜欢的音乐", "home.noFavorites": "你还没有喜欢的音乐。", "home.cleanHistory": "你的播放历史为空。", "home.addToPlaylist": "添加到歌单", "home.newPlaylistName": "新歌单名称...", "home.promptNewListName": "新歌单名称:",
    "track.back": "返回", "track.play": "播放", "track.addToQueue": "+ 添加到队列", "track.inFavorites": "已收藏", "track.addToFavorites": "添加到收藏", "track.addToList": "添加到歌单", "track.downloaded": "已下载", "track.download": "下载", "track.description": "描述", "track.relatedSongs": "相关歌曲", "track.noRelatedSongs": "未找到相关歌曲。", "track.noPlaylistYet": "还没有歌单。", "track.close": "关闭", "track.videoFailed": "视频加载失败", "track.unknownError": "未知错误", "track.views": "次观看", "track.likes": "次点赞",
    "playlist.deleteList": "删除歌单", "playlist.renameList": "重命名", "playlist.emptyPlaylist": "此歌单为空。", "playlist.addSongsFromExplore": "你可以从探索选项卡添加歌曲。", "playlist.remove": "移除", "playlist.playAll": "播放全部", "playlist.shufflePlay": "随机播放", "playlist.save": "保存", "playlist.cancel": "取消", "playlist.delete": "删除", "playlist.deleteWarning": "将被永久删除，无法恢复。",
    "player.audio": "音频", "player.video": "视频", "player.upNext": "接下来播放", "player.clearQueue": "清空队列", "player.close": "关闭",
  },
  ko: {
    "pwa.installBannerTitle": "앱 설치",
    "pwa.installBannerDesc": "더 나은 경험을 위해 앱을 설치하세요.",
    "pwa.installButton": "설치",
    "pwa.close": "닫기",
    "pwa.installApp": "앱 설치",
    "mood.goodNight": "안녕히 주무세요", "mood.goodMorning": "좋은 아침입니다", "mood.goodAfternoon": "좋은 오후입니다", "mood.goodEvening": "좋은 저녁입니다",
    "nav.home": "홈", "nav.explore": "탐색", "nav.library": "라이브러리",
    "search.title": "어떤 음악을 듣고 싶으신가요?", "search.placeholder": "곡, 아티스트 검색...", "search.hint": "2자 이상 입력하세요.", "search.description": "무제한 음악 카탈로그에서 검색하세요.",
    "home.recentlyPlayed": "최근 재생한 음악", "home.emptyRecentlyPlayed": "아직 음악을 듣지 않았습니다.", "home.madeForYou": "맞춤 추천", "home.emptyMadeForYou": "맞춤 추천을 위해 음악을 들어보세요.", "home.favorites": "즐겨찾기", "home.results": "개의 결과", "home.noResults": "결과 없음", "home.noResultsDesc": "다른 검색어로 다시 시도해보세요.", "home.somethingWentWrong": "오류가 발생했습니다.", "home.yourLibrary": "내 라이브러리", "home.newList": "새 목록", "home.playlists": "플레이리스트", "home.noPlaylists": "아직 목록이 없습니다.", "home.createFirstPlaylist": "첫 번째 목록 만들기", "home.songs": "곡", "home.song": "곡", "home.likedSongs": "좋아요 표시한 곡", "home.noFavorites": "아직 좋아하는 곡이 없습니다.", "home.cleanHistory": "기록이 없습니다.", "home.addToPlaylist": "목록에 추가", "home.newPlaylistName": "새 목록 이름...", "home.promptNewListName": "새 목록 이름:",
    "track.back": "뒤로", "track.play": "재생", "track.addToQueue": "+ 대기열에 추가", "track.inFavorites": "즐겨찾기 됨", "track.addToFavorites": "즐겨찾기에 추가", "track.addToList": "목록에 추가", "track.downloaded": "다운로드됨", "track.download": "다운로드", "track.description": "설명", "track.relatedSongs": "관련 곡", "track.noRelatedSongs": "관련 곡이 없습니다.", "track.noPlaylistYet": "아직 목록이 없습니다.", "track.close": "닫기", "track.videoFailed": "비디오 로드 실패", "track.unknownError": "알 수 없는 오류", "track.views": "회 조회", "track.likes": "명 좋아요",
    "playlist.deleteList": "목록 삭제", "playlist.renameList": "이름 변경", "playlist.emptyPlaylist": "목록이 비어 있습니다.", "playlist.addSongsFromExplore": "탐색 탭에서 곡을 추가할 수 있습니다.", "playlist.remove": "제거", "playlist.playAll": "모두 재생", "playlist.shufflePlay": "셔플 재생", "playlist.save": "저장", "playlist.cancel": "취소", "playlist.delete": "삭제", "playlist.deleteWarning": "목록이 영구적으로 삭제됩니다.",
    "player.audio": "오디오", "player.video": "비디오", "player.upNext": "다음 재생", "player.clearQueue": "대기열 지우기", "player.close": "닫기",
  },
  ar: {
    "pwa.installBannerTitle": "تثبيت التطبيق",
    "pwa.installBannerDesc": "قم بتثبيت تطبيقنا لتجربة أفضل.",
    "pwa.installButton": "تثبيت",
    "pwa.close": "إغلاق",
    "pwa.installApp": "تثبيت التطبيق",
    "mood.goodNight": "طابت ليلتك", "mood.goodMorning": "صباح الخير", "mood.goodAfternoon": "طاب مساؤك", "mood.goodEvening": "مساء الخير",
    "nav.home": "الرئيسية", "nav.explore": "استكشاف", "nav.library": "المكتبة",
    "search.title": "ماذا تريد أن تسمع؟", "search.placeholder": "ابحث عن الأغاني...", "search.hint": "اكتب حرفين على الأقل.", "search.description": "ابحث في كتالوج الموسيقى غير المحدود.",
    "home.recentlyPlayed": "تم تشغيله مؤخراً", "home.emptyRecentlyPlayed": "لم تستمع إلى أي موسيقى بعد.", "home.madeForYou": "مخصص لك", "home.emptyMadeForYou": "استمع لبعض الموسيقى لنقدم لك توصيات.", "home.favorites": "مفضلاتك", "home.results": "نتائج", "home.noResults": "لم يتم العثور على نتائج", "home.noResultsDesc": "حاول بكلمات أخرى.", "home.somethingWentWrong": "حدث خطأ ما.", "home.yourLibrary": "مكتبتك", "home.newList": "قائمة جديدة", "home.playlists": "قوائم التشغيل", "home.noPlaylists": "ليس لديك أي قوائم بعد.", "home.createFirstPlaylist": "أنشئ قائمتك الأولى", "home.songs": "أغاني", "home.song": "أغنية", "home.likedSongs": "الأغاني المعجب بها", "home.noFavorites": "ليس لديك أي أغاني مفضلة.", "home.cleanHistory": "سجلك نظيف.", "home.addToPlaylist": "أضف للقائمة", "home.newPlaylistName": "اسم القائمة الجديد...", "home.promptNewListName": "اسم القائمة الجديد:",
    "track.back": "رجوع", "track.play": "تشغيل", "track.addToQueue": "+ أضف للطابور", "track.inFavorites": "في المفضلة", "track.addToFavorites": "أضف للمفضلة", "track.addToList": "أضف للقائمة", "track.downloaded": "تم التنزيل", "track.download": "تنزيل", "track.description": "الوصف", "track.relatedSongs": "أغاني ذات صلة", "track.noRelatedSongs": "لم يتم العثور على أغانٍ ذات صلة.", "track.noPlaylistYet": "لا توجد قوائم بعد.", "track.close": "إغلاق", "track.videoFailed": "فشل تحميل الفيديو", "track.unknownError": "خطأ غير معروف", "track.views": "مشاهدات", "track.likes": "إعجابات",
    "playlist.deleteList": "حذف القائمة", "playlist.renameList": "إعادة تسمية", "playlist.emptyPlaylist": "هذه القائمة فارغة.", "playlist.addSongsFromExplore": "يمكنك إضافة الأغاني من الاستكشاف.", "playlist.remove": "إزالة", "playlist.playAll": "تشغيل الكل", "playlist.shufflePlay": "تشغيل عشوائي", "playlist.save": "حفظ", "playlist.cancel": "إلغاء", "playlist.delete": "حذف", "playlist.deleteWarning": "سيتم حذف القائمة نهائياً.",
    "player.audio": "صوت", "player.video": "فيديو", "player.upNext": "التالي", "player.clearQueue": "مسح الطابور", "player.close": "إغلاق",
  },
  hi: {
    "pwa.installBannerTitle": "ऐप इंस्टॉल करें",
    "pwa.installBannerDesc": "बेहतर अनुभव के लिए हमारा ऐप इंस्टॉल करें।",
    "pwa.installButton": "इंस्टॉल करें",
    "pwa.close": "बंद करें",
    "pwa.installApp": "ऐप इंस्टॉल करें",
    "mood.goodNight": "शुभ रात्रि", "mood.goodMorning": "सुप्रभात", "mood.goodAfternoon": "शुभ दोपहर", "mood.goodEvening": "शुभ संध्या",
    "nav.home": "होम", "nav.explore": "खोजें", "nav.library": "लाइब्रेरी",
    "search.title": "आप क्या सुनना चाहते हैं?", "search.placeholder": "गाने, कलाकार खोजें...", "search.hint": "कम से कम 2 अक्षर टाइप करें।", "search.description": "असीमित संगीत सूची में खोजें।",
    "home.recentlyPlayed": "हाल ही में बजाए गए", "home.emptyRecentlyPlayed": "आपने अभी तक कुछ नहीं सुना है।", "home.madeForYou": "आपके लिए", "home.emptyMadeForYou": "संगीत सुनें ताकि हम आपको सुझाव दे सकें।", "home.favorites": "आपके पसंदीदा", "home.results": "परिणाम", "home.noResults": "कोई परिणाम नहीं", "home.noResultsDesc": "अन्य कीवर्ड के साथ प्रयास करें।", "home.somethingWentWrong": "कुछ गलत हो गया।", "home.yourLibrary": "आपकी लाइब्रेरी", "home.newList": "नई सूची", "home.playlists": "प्लेलिस्ट", "home.noPlaylists": "आपके पास अभी कोई सूची नहीं है।", "home.createFirstPlaylist": "अपनी पहली सूची बनाएं", "home.songs": "गाने", "home.song": "गाना", "home.likedSongs": "पसंदीदा गाने", "home.noFavorites": "आपके कोई पसंदीदा गाने नहीं हैं।", "home.cleanHistory": "आपका इतिहास साफ़ है।", "home.addToPlaylist": "सूची में जोड़ें", "home.newPlaylistName": "नई सूची का नाम...", "home.promptNewListName": "नई सूची का नाम:",
    "track.back": "वापस", "track.play": "बजाएं", "track.addToQueue": "+ कतार में जोड़ें", "track.inFavorites": "पसंदीदा में है", "track.addToFavorites": "पसंदीदा में जोड़ें", "track.addToList": "सूची में जोड़ें", "track.downloaded": "डाउनलोड किया गया", "track.download": "डाउनलोड करें", "track.description": "विवरण", "track.relatedSongs": "संबंधित गाने", "track.noRelatedSongs": "कोई संबंधित गाने नहीं मिले।", "track.noPlaylistYet": "कोई सूची नहीं।", "track.close": "बंद करें", "track.videoFailed": "वीडियो लोड करने में विफल", "track.unknownError": "अज्ञात त्रुटि", "track.views": "दृश्य", "track.likes": "पसंद",
    "playlist.deleteList": "सूची हटाएं", "playlist.renameList": "नाम बदलें", "playlist.emptyPlaylist": "यह सूची खाली है।", "playlist.addSongsFromExplore": "आप खोजें से गाने जोड़ सकते हैं।", "playlist.remove": "हटाएं", "playlist.playAll": "सभी बजाएं", "playlist.shufflePlay": "शफ़ल प्ले", "playlist.save": "सहेजें", "playlist.cancel": "रद्द करें", "playlist.delete": "हटाएं", "playlist.deleteWarning": "स्थायी रूप से हटा दिया जाएगा।",
    "player.audio": "ऑडियो", "player.video": "वीडियो", "player.upNext": "अगला", "player.clearQueue": "कतार साफ़ करें", "player.close": "बंद करें",
  },
  sv: {
    "pwa.installBannerTitle": "Installera app",
    "pwa.installBannerDesc": "Installera vår app för en bättre upplevelse.",
    "pwa.installButton": "Installera",
    "pwa.close": "Stäng",
    "pwa.installApp": "Installera App",
    "mood.goodNight": "God Natt", "mood.goodMorning": "God Morgon", "mood.goodAfternoon": "God Eftermiddag", "mood.goodEvening": "God Kväll",
    "nav.home": "Hem", "nav.explore": "Utforska", "nav.library": "Bibliotek",
    "search.title": "Vad vill du lyssna på?", "search.placeholder": "Sök låtar...", "search.hint": "Skriv minst 2 tecken.", "search.description": "Sök i den obegränsade musikkatalogen.",
    "home.recentlyPlayed": "Nyligen spelade", "home.emptyRecentlyPlayed": "Du har inte lyssnat på musik än.", "home.madeForYou": "Skapat för dig", "home.emptyMadeForYou": "Lyssna på musik för rekommendationer.", "home.favorites": "Dina favoriter", "home.results": "resultat", "home.noResults": "Inga resultat", "home.noResultsDesc": "Försök med andra sökord.", "home.somethingWentWrong": "Något gick fel.", "home.yourLibrary": "Ditt bibliotek", "home.newList": "Ny lista", "home.playlists": "Spellistor", "home.noPlaylists": "Du har inga listor än.", "home.createFirstPlaylist": "Skapa din första lista", "home.songs": "låtar", "home.song": "låt", "home.likedSongs": "Gillade låtar", "home.noFavorites": "Du har inga favoritlåtar.", "home.cleanHistory": "Din historik är tom.", "home.addToPlaylist": "Lägg till i lista", "home.newPlaylistName": "Nytt listnamn...", "home.promptNewListName": "Nytt listnamn:",
    "track.back": "Tillbaka", "track.play": "Spela", "track.addToQueue": "+ Lägg i kö", "track.inFavorites": "I favoriter", "track.addToFavorites": "Lägg till i favoriter", "track.addToList": "Lägg till i lista", "track.downloaded": "Nedladdad", "track.download": "Ladda ner", "track.description": "Beskrivning", "track.relatedSongs": "Liknande låtar", "track.noRelatedSongs": "Inga liknande låtar hittades.", "track.noPlaylistYet": "Inga spellistor än.", "track.close": "Stäng", "track.videoFailed": "Kunde inte ladda video", "track.unknownError": "Okänt fel", "track.views": "visningar", "track.likes": "gilla",
    "playlist.deleteList": "Radera lista", "playlist.renameList": "Byt namn", "playlist.emptyPlaylist": "Listan är tom.", "playlist.addSongsFromExplore": "Lägg till låtar från Utforska.", "playlist.remove": "Ta bort", "playlist.playAll": "Spela alla", "playlist.shufflePlay": "Blanda", "playlist.save": "Spara", "playlist.cancel": "Avbryt", "playlist.delete": "Radera", "playlist.deleteWarning": "raderas permanent.",
    "player.audio": "Ljud", "player.video": "Video", "player.upNext": "Härnäst", "player.clearQueue": "Rensa kö", "player.close": "Stäng",
  },
  nl: {
    "pwa.installBannerTitle": "App installeren",
    "pwa.installBannerDesc": "Installeer onze app voor een betere ervaring.",
    "pwa.installButton": "Installeren",
    "pwa.close": "Sluiten",
    "pwa.installApp": "App installeren",
    "mood.goodNight": "Goedenacht", "mood.goodMorning": "Goedemorgen", "mood.goodAfternoon": "Goedemiddag", "mood.goodEvening": "Goedenavond",
    "nav.home": "Home", "nav.explore": "Ontdekken", "nav.library": "Bibliotheek",
    "search.title": "Wat wil je luisteren?", "search.placeholder": "Zoek nummers...", "search.hint": "Typ minimaal 2 tekens.", "search.description": "Zoek in de onbeperkte muziekcatalogus.",
    "home.recentlyPlayed": "Recent afgespeeld", "home.emptyRecentlyPlayed": "Je hebt nog geen muziek geluisterd.", "home.madeForYou": "Voor jou gemaakt", "home.emptyMadeForYou": "Luister muziek voor aanbevelingen.", "home.favorites": "Jouw favorieten", "home.results": "resultaten", "home.noResults": "Geen resultaten", "home.noResultsDesc": "Probeer andere zoekwoorden.", "home.somethingWentWrong": "Er is iets misgegaan.", "home.yourLibrary": "Jouw Bibliotheek", "home.newList": "Nieuwe lijst", "home.playlists": "Afspeellijsten", "home.noPlaylists": "Je hebt nog geen lijsten.", "home.createFirstPlaylist": "Maak je eerste lijst", "home.songs": "nummers", "home.song": "nummer", "home.likedSongs": "Gelikete nummers", "home.noFavorites": "Je hebt nog geen favoriete nummers.", "home.cleanHistory": "Je geschiedenis is leeg.", "home.addToPlaylist": "Toevoegen aan lijst", "home.newPlaylistName": "Nieuwe lijst naam...", "home.promptNewListName": "Nieuwe lijst naam:",
    "track.back": "Terug", "track.play": "Afspelen", "track.addToQueue": "+ In wachtrij", "track.inFavorites": "In favorieten", "track.addToFavorites": "Toevoegen aan favorieten", "track.addToList": "Toevoegen aan lijst", "track.downloaded": "Gedownload", "track.download": "Downloaden", "track.description": "Beschrijving", "track.relatedSongs": "Gerelateerde nummers", "track.noRelatedSongs": "Geen gerelateerde nummers gevonden.", "track.noPlaylistYet": "Nog geen lijsten.", "track.close": "Sluiten", "track.videoFailed": "Video laden mislukt", "track.unknownError": "Onbekende fout", "track.views": "weergaven", "track.likes": "likes",
    "playlist.deleteList": "Lijst verwijderen", "playlist.renameList": "Hernoemen", "playlist.emptyPlaylist": "Deze lijst is leeg.", "playlist.addSongsFromExplore": "Voeg nummers toe via Ontdekken.", "playlist.remove": "Verwijderen", "playlist.playAll": "Alles afspelen", "playlist.shufflePlay": "Shuffle", "playlist.save": "Opslaan", "playlist.cancel": "Annuleren", "playlist.delete": "Verwijderen", "playlist.deleteWarning": "wordt permanent verwijderd.",
    "player.audio": "Audio", "player.video": "Video", "player.upNext": "Hierna", "player.clearQueue": "Wachtrij wissen", "player.close": "Sluiten",
  },
  el: {
    "pwa.installBannerTitle": "Εγκατάσταση εφαρμογής",
    "pwa.installBannerDesc": "Εγκαταστήστε την εφαρμογή μας για καλύτερη εμπειρία.",
    "pwa.installButton": "Εγκατάσταση",
    "pwa.close": "Κλείσιμο",
    "pwa.installApp": "Εγκατάσταση εφαρμογής",
    "mood.goodNight": "Καληνύχτα", "mood.goodMorning": "Καλημέρα", "mood.goodAfternoon": "Καλό Μεσημέρι", "mood.goodEvening": "Καλησπέρα",
    "nav.home": "Αρχική", "nav.explore": "Εξερεύνηση", "nav.library": "Βιβλιοθήκη",
    "search.title": "Τι θέλεις να ακούσεις;", "search.placeholder": "Αναζήτηση...", "search.hint": "Πληκτρολόγησε τουλάχιστον 2 χαρακτήρες.", "search.description": "Αναζήτησε στον απεριόριστο κατάλογο.",
    "home.recentlyPlayed": "Πρόσφατα", "home.emptyRecentlyPlayed": "Δεν άκουσες μουσική ακόμα.", "home.madeForYou": "Για εσένα", "home.emptyMadeForYou": "Άκου μουσική για προτάσεις.", "home.favorites": "Αγαπημένα", "home.results": "αποτελέσματα", "home.noResults": "Κανένα αποτέλεσμα", "home.noResultsDesc": "Δοκίμασε άλλες λέξεις.", "home.somethingWentWrong": "Κάτι πήγε στραβά.", "home.yourLibrary": "Η Βιβλιοθήκη σου", "home.newList": "Νέα λίστα", "home.playlists": "Λίστες", "home.noPlaylists": "Δεν έχεις λίστες ακόμα.", "home.createFirstPlaylist": "Φτιάξε την πρώτη σου λίστα", "home.songs": "τραγούδια", "home.song": "τραγούδι", "home.likedSongs": "Αγαπημένα τραγούδια", "home.noFavorites": "Δεν έχεις αγαπημένα.", "home.cleanHistory": "Το ιστορικό είναι καθαρό.", "home.addToPlaylist": "Προσθήκη", "home.newPlaylistName": "Όνομα λίστας...", "home.promptNewListName": "Όνομα λίστας:",
    "track.back": "Πίσω", "track.play": "Αναπαραγωγή", "track.addToQueue": "+ Στην ουρά", "track.inFavorites": "Στα αγαπημένα", "track.addToFavorites": "Προσθήκη στα αγαπημένα", "track.addToList": "Στη λίστα", "track.downloaded": "Κατέβηκε", "track.download": "Λήψη", "track.description": "Περιγραφή", "track.relatedSongs": "Σχετικά", "track.noRelatedSongs": "Δεν βρέθηκαν σχετικά.", "track.noPlaylistYet": "Καμία λίστα ακόμα.", "track.close": "Κλείσιμο", "track.videoFailed": "Σφάλμα βίντεο", "track.unknownError": "Άγνωστο σφάλμα", "track.views": "προβολές", "track.likes": "μου αρέσει",
    "playlist.deleteList": "Διαγραφή λίστας", "playlist.renameList": "Μετονομασία", "playlist.emptyPlaylist": "Η λίστα είναι άδεια.", "playlist.addSongsFromExplore": "Πρόσθεσε από την Εξερεύνηση.", "playlist.remove": "Αφαίρεση", "playlist.playAll": "Αναπαραγωγή όλων", "playlist.shufflePlay": "Τυχαία", "playlist.save": "Αποθήκευση", "playlist.cancel": "Ακύρωση", "playlist.delete": "Διαγραφή", "playlist.deleteWarning": "θα διαγραφεί οριστικά.",
    "player.audio": "Ήχος", "player.video": "Βίντεο", "player.upNext": "Επόμενο", "player.clearQueue": "Καθαρισμός", "player.close": "Κλείσιμο",
  },
  pl: {
    "pwa.installBannerTitle": "Zainstaluj aplikację",
    "pwa.installBannerDesc": "Zainstaluj naszą aplikację, aby uzyskać lepsze wrażenia.",
    "pwa.installButton": "Zainstaluj",
    "pwa.close": "Zamknij",
    "pwa.installApp": "Zainstaluj aplikację",
    "mood.goodNight": "Dobranoc", "mood.goodMorning": "Dzień dobry", "mood.goodAfternoon": "Dzień dobry", "mood.goodEvening": "Dobry wieczór",
    "nav.home": "Główna", "nav.explore": "Odkrywaj", "nav.library": "Biblioteka",
    "search.title": "Czego chcesz posłuchać?", "search.placeholder": "Szukaj utworów...", "search.hint": "Wpisz co najmniej 2 znaki.", "search.description": "Szukaj w nieograniczonym katalogu.",
    "home.recentlyPlayed": "Ostatnio słuchane", "home.emptyRecentlyPlayed": "Jeszcze nic nie słuchałeś.", "home.madeForYou": "Dla Ciebie", "home.emptyMadeForYou": "Posłuchaj muzyki, aby otrzymać polecenia.", "home.favorites": "Twoje ulubione", "home.results": "wyników", "home.noResults": "Brak wyników", "home.noResultsDesc": "Spróbuj z innymi słowami.", "home.somethingWentWrong": "Coś poszło nie tak.", "home.yourLibrary": "Twoja Biblioteka", "home.newList": "Nowa lista", "home.playlists": "Playlisty", "home.noPlaylists": "Nie masz jeszcze list.", "home.createFirstPlaylist": "Stwórz pierwszą listę", "home.songs": "utworów", "home.song": "utwór", "home.likedSongs": "Polubione utwory", "home.noFavorites": "Brak polubionych utworów.", "home.cleanHistory": "Historia jest pusta.", "home.addToPlaylist": "Dodaj do listy", "home.newPlaylistName": "Nazwa listy...", "home.promptNewListName": "Nazwa listy:",
    "track.back": "Wróć", "track.play": "Odtwórz", "track.addToQueue": "+ Do kolejki", "track.inFavorites": "W ulubionych", "track.addToFavorites": "Dodaj do ulubionych", "track.addToList": "Dodaj do listy", "track.downloaded": "Pobrane", "track.download": "Pobierz", "track.description": "Opis", "track.relatedSongs": "Powiązane", "track.noRelatedSongs": "Brak powiązanych utworów.", "track.noPlaylistYet": "Brak list.", "track.close": "Zamknij", "track.videoFailed": "Nie udało się załadować wideo", "track.unknownError": "Nieznany błąd", "track.views": "wyświetleń", "track.likes": "polubień",
    "playlist.deleteList": "Usuń listę", "playlist.renameList": "Zmień nazwę", "playlist.emptyPlaylist": "Ta lista jest pusta.", "playlist.addSongsFromExplore": "Możesz dodać utwory z Odkrywaj.", "playlist.remove": "Usuń", "playlist.playAll": "Odtwórz wszystko", "playlist.shufflePlay": "Losowo", "playlist.save": "Zapisz", "playlist.cancel": "Anuluj", "playlist.delete": "Usuń", "playlist.deleteWarning": "zostanie trwale usunięta.",
    "player.audio": "Dźwięk", "player.video": "Wideo", "player.upNext": "Następnie", "player.clearQueue": "Wyczyść kolejkę", "player.close": "Zamknij",
  },
} as const;

export type Locale = keyof typeof dictionaries;
export type DictionaryKey = keyof typeof dictionaries.en;

// ── Context ────────────────────────────────────────────────────────────────

type I18nContextType = {
  locale: Locale;
  t: (key: DictionaryKey) => string;
};

const I18nContext = createContext<I18nContextType>({
  locale: "tr",
  t: (key) => dictionaries.tr[key] ?? key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("tr");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const browserLang = navigator.language.toLowerCase();
      
      let detectedLocale: Locale = "en"; // fallback
      
      if (browserLang.startsWith("tr")) detectedLocale = "tr";
      else if (browserLang.startsWith("de")) detectedLocale = "de";
      else if (browserLang.startsWith("fr")) detectedLocale = "fr";
      else if (browserLang.startsWith("ru")) detectedLocale = "ru";
      else if (browserLang.startsWith("es")) detectedLocale = "es";
      else if (browserLang.startsWith("it")) detectedLocale = "it";
      else if (browserLang.startsWith("pt")) detectedLocale = "pt";
      else if (browserLang.startsWith("ja")) detectedLocale = "ja";
      else if (browserLang.startsWith("zh")) detectedLocale = "zh";
      else if (browserLang.startsWith("ko")) detectedLocale = "ko";
      else if (browserLang.startsWith("ar")) detectedLocale = "ar";
      else if (browserLang.startsWith("hi")) detectedLocale = "hi";
      else if (browserLang.startsWith("sv")) detectedLocale = "sv";
      else if (browserLang.startsWith("nl")) detectedLocale = "nl";
      else if (browserLang.startsWith("el")) detectedLocale = "el";
      else if (browserLang.startsWith("pl")) detectedLocale = "pl";
      else if (browserLang.startsWith("en")) detectedLocale = "en";

      setLocale(detectedLocale);
      
      // Handle RTL layout for Arabic
      if (detectedLocale === "ar") {
        document.documentElement.dir = "rtl";
        document.documentElement.lang = "ar";
      } else {
        document.documentElement.dir = "ltr";
        document.documentElement.lang = detectedLocale;
      }
      
      setIsHydrated(true);
    }
  }, []);

  const t = (key: DictionaryKey): string => {
    return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
