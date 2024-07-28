const fetchMovieTrailer = async (ytTrailerCode) => {
  console.log('ytTrailerCode', ytTrailerCode);
  let url = `https://ovtv.me/api/?v=${ytTrailerCode}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const res = await response.json();
    return res;
  } catch (error) {
    console.error('Failed to fetch movies data:', error);
    return false;
  }
};

const extractVideo = (response) => {
  if (response.callback && response.callback.last) {
    return response.callback.last;
  } else if (response.data) {
    for (const key in response.data) {
      if (response.data.hasOwnProperty(key) && response.data[key].url) {
        return response.data[key].url;
      }
    }
  }
};
