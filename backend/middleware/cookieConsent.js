export const checkCookieConsent = (req, res, next) => {
  if (!req.cookies.consent) {
    return res.status(403).json({
      status: 'fail',
      message: 'Cookie consent required. Please accept our cookie policy.'
    });
  }
  next();
};