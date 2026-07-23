function resolveBuildInstant(env = process.env, fallback = new Date()) {
  if (env.SOURCE_DATE_EPOCH && /^\d+$/.test(env.SOURCE_DATE_EPOCH)) {
    return new Date(Number(env.SOURCE_DATE_EPOCH) * 1000);
  }
  if (env.BUILD_DATE) {
    const parsed = new Date(`${env.BUILD_DATE}T12:00:00Z`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
}

function resolveRomeCalendarDate(now = new Date()) {
  const dateParts = Object.fromEntries(
    new Intl.DateTimeFormat('en', {
      timeZone: 'Europe/Rome',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
      .formatToParts(now)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );

  return {
    iso: `${dateParts.year}-${dateParts.month}-${dateParts.day}`,
    formatted: new Intl.DateTimeFormat('it-IT', {
      timeZone: 'Europe/Rome',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(now)
  };
}

module.exports = {
  resolveBuildInstant,
  resolveRomeCalendarDate
};
