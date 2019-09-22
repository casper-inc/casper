/**
 *
 * Google Mock Data
 */

const googleMock = (req, res, next) => {
  req.user = {
    id: '1283637238389',
    displayName: 'Casper voyager',
    name: {
      familyName: 'voyager',
      givenName: 'Casper'
    },
    emails: [{ value: 'casper.caspervoyager9@gmail.com', verified: true }],
    photos: [
      {
        value:
          'https://lh6.googleusercontent.com/-2BlqgBk4Y3M/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rdOsWp-Z4uy0OPYuat0AtpEDMkTOw/photo.jpg'
      }
    ],
    provider: 'facebook',
    _raw:
    '{\n  "sub": "116080001749246744313",\n  "name": "Casper voyager",\n  "given_name": "Casper",\n  "family_name": "voyager",\n  "picture": "https://lh6.googleusercontent.com/-2BlqgBk4Y3M/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rdOsWp-Z4uy0OPYuat0AtpEDMkTOw/photo.jpg",\n  "email": "casper.Caspervoyager@gmail.com",\n  "email_verified": true,\n  "locale": "en"\n}',
    _json: {
      sub: '1283637238389',
      name: 'Casper voyager',
      given_name: 'Casper',
      family_name: 'voyager',
      picture: 'https://lh6.googleusercontent.com/-2BlqgBk4Y3M/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rdOsWp-Z4uy0OPYuat0AtpEDMkTOw/photo.jpg',
      email: 'ejimchisom@gmail.com',
      email_verified: true,
      locale: 'en'
    }
  };
  next();
};

export default googleMock;
