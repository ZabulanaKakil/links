window.LinksIcons = (function () {
  var pool = [
    { id: "link", label: "Link", set: "mdi", icon: "link-variant", color: "7c3aed" },
    { id: "globe", label: "Website", set: "mdi", icon: "web", color: "7c3aed" },
    { id: "portfolio", label: "Portfolio", set: "mdi", icon: "briefcase-account", color: "7c3aed" },
    { id: "news", label: "News", set: "mdi", icon: "newspaper-variant", color: "7c3aed" },
    { id: "office", label: "Office", set: "mdi", icon: "office-building", color: "7c3aed" },
    { id: "event", label: "Event", set: "mdi", icon: "calendar-star", color: "7c3aed" },
    { id: "phone", label: "Phone", set: "mdi", icon: "phone", color: "7c3aed" },
    { id: "email", label: "Email", set: "mdi", icon: "email", color: "7c3aed" },
    { id: "whatsapp", label: "WhatsApp", set: "simple-icons", icon: "whatsapp", color: "25D366" },
    { id: "facebook", label: "Facebook", set: "simple-icons", icon: "facebook", color: "1877F2" },
    { id: "facebook-page", label: "Facebook Page", set: "mdi", icon: "facebook", color: "1877F2" },
    { id: "instagram", label: "Instagram", set: "simple-icons", icon: "instagram", color: "E4405F" },
    { id: "linkedin", label: "LinkedIn", set: "simple-icons", icon: "linkedin", color: "0A66C2" },
    { id: "discord", label: "Discord", set: "simple-icons", icon: "discord", color: "5865F2" },
    { id: "github", label: "GitHub", set: "simple-icons", icon: "github", color: "181717" },
    { id: "gmail", label: "Gmail", set: "simple-icons", icon: "gmail", color: "EA4335" },
    { id: "youtube", label: "YouTube", set: "simple-icons", icon: "youtube", color: "FF0000" },
    { id: "x", label: "X / Twitter", set: "simple-icons", icon: "x", color: "000000" },
    { id: "telegram", label: "Telegram", set: "simple-icons", icon: "telegram", color: "26A5E4" }
  ];

  var byId = {};
  pool.forEach(function (item) {
    byId[item.id] = item;
  });

  function getUrl(iconId) {
    var item = byId[iconId] || byId.link;
    return (
      "https://api.iconify.design/" +
      item.set +
      "/" +
      item.icon +
      ".svg?color=%23" +
      item.color
    );
  }

  function getLabel(iconId) {
    return (byId[iconId] || byId.link).label;
  }

  return {
    pool: pool,
    getUrl: getUrl,
    getLabel: getLabel,
    defaultId: "link"
  };
})();
