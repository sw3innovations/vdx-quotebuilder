const isNode = typeof window === 'undefined';

const getAppParams = () => {
  if (isNode) return { phone: null, name: null };

  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get('phone');
  const name  = urlParams.get('name');

  if (phone || name) {
    urlParams.delete('phone');
    urlParams.delete('name');
    const newUrl =
      window.location.pathname +
      (urlParams.toString() ? `?${urlParams.toString()}` : '') +
      window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
  }

  return { phone, name };
};

export const appParams = getAppParams();
