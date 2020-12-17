import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import server from '..';
import {
  newCompanyUser, createCompanyFacility, tripRequest, multiLegTrip, badTripRequest
} from './dummies';
import { AuthController, RequestController } from '../controllers';
import { RequestService } from '../services';
import db from '../models';

const { Request } = db;
const { companySignUp, userSignup } = AuthController;

chai.use(chaiHttp);
chai.use(sinonChai);

let newlyCreatedCompany;
let newlyCreatedRequest;
let companyAdminToken;
let adminId;
let userToken;
let userId;
let companyAdminResponse;

const [companyAdmin] = createCompanyFacility;
const [noOriginTrip, noDestinationTrip, noDepartureDateTrip] = badTripRequest;

before(async () => {
  const reqCompany = { body: { ...companyAdmin, email: 'baystef@slack.com', companyName: 'paystack' } };

  const res = {
    status() {
      return this;
    },
    cookie() {
      return this;
    },
    json(obj) {
      return obj;
    }
  };

  companyAdminResponse = await companySignUp(reqCompany, res);
  const { data: { signupToken, admin } } = companyAdminResponse;
  const reqUser = {
    body: {
      ...newCompanyUser, email: 'steve@google.com', signupToken, roleId: 5
    }
  };
  const companyUserResponse = await userSignup(reqUser, res);
  companyAdminToken = admin.token;
  userToken = companyUserResponse.data.token;
  userId = companyUserResponse.data.id;
  adminId = admin.id;
});
afterEach(() => {
  sinon.restore();
});


describe('Request Endpoints', () => {
  it('should create request successfully with a status of 201', async () => {
    const { dataValues } = await Request.create({ ...tripRequest, requesterId: userId, managerId: adminId });
    newlyCreatedRequest = dataValues;
  });
  it('MANAGER should get request by id in token and param status', async () => {
    const response = await chai
      .request(server)
      .get(`/api/users/requests/${newlyCreatedRequest.statusId}`)
      .set('Cookie', `token=${companyAdminToken}`);
    expect(response).to.have.status(200);
    expect(response.body.status).to.equal('success');
  });

  it('should throw error if wrong status param is passed', async () => {
    const response = await chai
      .request(server)
      .get('/api/users/requests/5')
      .set('Cookie', `token=${companyAdminToken}`);
    expect(response).to.have.status(400);
    expect(response.body.error.message).to.equal('Request statusId can only be values 1, 2, 3 - approved, pending, rejected');
  });

  it('User should be able to get trip request for edit', async () => {
    const response = await chai
      .request(server)
      .get(`/api/users/requests/${newlyCreatedRequest.id}/edit`)
      .set('Cookie', `token=${userToken}`);
    expect(response).to.have.status(200);
    expect(response.body.status).to.equal('success');
  });

  it('should throw an error if user does not own the trip request', async () => {
    const response = await chai
      .request(server)
      .get(`/api/users/requests/${newlyCreatedRequest.id}/edit`)
      .set('Cookie', `token=${companyAdminToken}`);
    expect(response).to.have.status(401);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error.message).to.equal('You have no permission to edit this request');
  });

  it('should throw an error if trip request body contains statusId || requesterId', async () => {
    const response = await chai
      .request(server)
      .put(`/api/users/requests/${newlyCreatedRequest.id}/update`)
      .set('Cookie', `token=${userToken}`)
      .send({ statusId: 1, purpose: 'just official' });
    expect(response).to.have.status(401);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error.message).to.equal('You can not edit this field');
  });

  it('User should be able to update trip request', async () => {
    const response = await chai
      .request(server)
      .put(`/api/users/requests/${newlyCreatedRequest.id}/update`)
      .set('Cookie', `token=${userToken}`)
      .send({ purpose: 'just official', rememberMe: true, departureDate: '2019-12-09' });
    expect(response).to.have.status(200);
    expect(response.body.status).to.equal('success');
  });

  const newlyRequest = { statusId: 1 };

  it('MANAGER should update request by request id in params', async () => {
    const response = await chai
      .request(server)
      .patch(`/api/users/requests/${newlyCreatedRequest.id}`)
      .set('Cookie', `token=${companyAdminToken}`)
      .send(newlyRequest);
    expect(response).to.have.status(200);
    expect(response.body.status).to.equal('success');
  });
  it('should throw an error for user if request is NOT PENDING', async () => {
    const response = await chai
      .request(server)
      .get(`/api/users/requests/${newlyCreatedRequest.id}/edit`)
      .set('Cookie', `token=${userToken}`);
    expect(response).to.have.status(400);
    expect(response.body.status).to.equal('fail');
  });

  it('should throw error if wrong requestId is specified by MANAGER', async () => {
    const response = await chai
      .request(server)
      .patch('/api/users/requests/hh')
      .set('Cookie', `token=${companyAdminToken};`)
      .send(newlyRequest);
    expect(response).to.have.status(400);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error.message).to.equal('Request Id can only be a number');
  });

  const wrongRequest = { statusId: '6' };

  it('should throw error if wrong status update is specified by MANAGER', async () => {
    const response = await chai
      .request(server)
      .patch(`/api/users/requests/${newlyCreatedRequest.id}`)
      .set('Cookie', `token=${companyAdminToken};`)
      .send(wrongRequest);
    expect(response).to.have.status(400);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error.message).to.equal('Request statusId can only be values 1, 2, 3 - approved, pending, rejected');
  });

  it('should throw error if wrong request id is specified by MANAGER', async () => {
    const response = await chai
      .request(server)
      .patch('/api/users/requests/1234')
      .set('Cookie', `token=${companyAdminToken};`)
      .send(newlyRequest);
    expect(response).to.have.status(404);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error.message).to.equal('updateRequest: No such request');
  });
});

describe('Request route endpoints', () => {
  before(async () => {
    const res = {
      status() {
        return this;
      },
      cookie() {
        return this;
      },
      json(obj) {
        return obj;
      }
    };

    const { data: { signupToken, admin } } = companyAdminResponse;
    const reqUser = {
      body: {
        ...newCompanyUser, email: 'bayo@google.com', signupToken, roleId: 5
      }
    };
    const companyUserResponse = await userSignup(reqUser, res);
    userToken = companyUserResponse.data.token;
    userId = companyUserResponse.data.id;
    adminId = admin.id;
  });
  afterEach(() => {
    sinon.restore();
  });

  describe('GET api/users/requests', () => {
    it('should return 404 for user with no request yet', async () => {
      const response = await chai.request(server).get('/api/users/requests').set('Cookie', `token=${userToken}`);
      expect(response).to.have.status(404);
      expect(response.body.error.message).to.be.eql('You have made no request yet');
    });
    it('should return a 500 error if something goes wrong while getting the requests', async () => {
      const req = {
        body: {}
      };
      const mockResponse = () => {
        const res = {};
        res.status = sinon.stub().returns(res);
        res.json = sinon.stub().returns(res);
        return res;
      };
      const res = mockResponse();
      sinon.stub(RequestService, 'getRequests').throws();
      await RequestController.getUserRequests(req, res);
      expect(res.status).to.have.been.calledWith(500);
    });
    it('should get a request successfuly', async () => {
      await Request.create({ ...tripRequest, requesterId: userId, managerId: adminId });
      const response = await chai.request(server).get('/api/users/requests').set('Cookie', `token=${userToken}`);
      expect(response).to.have.status(200);
      expect(response.body.status).to.equal('success');
    });
  });

  describe('Trip Request Endpoint', () => {
    it('should successfully create a one-way trip request', async () => {
      const response = await chai
        .request(server).post('/api/trip/request').set('Cookie', `token=${userToken};`)
        .send({ ...tripRequest, managerId: adminId });
      expect(response).to.have.status(201);
      expect(response.body.data).to.include({
        purpose: 'Official',
        tripType: 'One-way'
      });
      expect(response.body.data.tripDetails[0]).to.include({
        origin: 'Abuja',
        destination: 'Lagos',
        departureDate: '2020-11-07T00:00:00.000Z'
      });
    });

    it('should return validation error tripType is invalid', async () => {
      const response = await chai
        .request(server).post('/api/trip/request').set('Cookie', `token=${userToken};`)
        .send({ ...tripRequest, tripType: 'kkhkh' });
      expect(response.body.status).to.equal('fail');
      expect(response.body.error).to.be.a('object');
      expect(response.body.error.message).to.equal('Trip type must be One-way, Round-Trip or Multi-leg');
    });

    it('should return validation error tripType is empty', async () => {
      const response = await chai
        .request(server).post('/api/trip/request').set('Cookie', `token=${userToken};`)
        .send({ ...tripRequest, tripType: '' });
      expect(response.body.status).to.equal('fail');
      expect(response.body.error).to.be.a('object');
      expect(response.body.error.message).to.equal('Trip type must be One-way, Round-Trip or Multi-leg');
    });

    it('should return validation error purpose is empty', async () => {
      const response = await chai
        .request(server).post('/api/trip/request').set('Cookie', `token=${userToken};`)
        .send({ ...tripRequest, purpose: '' });
      expect(response.body.status).to.equal('fail');
      expect(response.body.error).to.be.a('object');
      expect(response.body.error.message).to.equal('Please add a short and valid purpose');
    });
    it('should return validation error if purpose is less than 3 characters', async () => {
      const response = await chai
        .request(server).post('/api/trip/request').set('Cookie', `token=${userToken};`)
        .send({ ...tripRequest, purpose: 'a' });
      expect(response.body.status).to.equal('fail');
      expect(response.body.error).to.be.a('object');
      expect(response.body.error.message).to.equal('Please add a short and valid purpose');
    });

    it('should return validation error if origin is empty', async () => {
      const response = await chai
        .request(server).post('/api/trip/request').set('Cookie', `token=${userToken};`)
        .send(noOriginTrip);
      expect(response.body.status).to.equal('fail');
      expect(response.body.error).to.be.a('object');
      expect(response.body.error.message).to.equal('Please enter a valid origin');
    });
    it('should return validation error if destination is empty', async () => {
      const response = await chai
        .request(server).post('/api/trip/request').set('Cookie', `token=${userToken};`)
        .send(noDestinationTrip);
      expect(response.body.status).to.equal('fail');
      expect(response.body.error).to.be.a('object');
      expect(response.body.error.message).to.equal('Please enter a valid destination');
    });
    it('should return validation error if departureDate is empty', async () => {
      const response = await chai
        .request(server).post('/api/trip/request').set('Cookie', `token=${userToken};`)
        .send(noDepartureDateTrip);
      expect(response.body.status).to.equal('fail');
      expect(response.body.error).to.be.a('object');
      expect(response.body.error.message).to.equal('Please enter a valid departure date');
    });
  });

  describe('Multi-leg Trip Request', () => {
    it('should successfully create a multi-leg trip and return 201', async () => {
      const response = await chai.request(server).post('/api/trip/request').set('Cookie', `token=${userToken};`).send(multiLegTrip);
      expect(response).to.have.status(201);
      expect(response.body.data.tripType).to.equal('Multi-leg');
      expect(response.body.data.tripDetails).to.be.an('array');
    });
    it('should throw an error if request has less than 2 trip details', async () => {
      const response = await chai.request(server).post('/api/trip/request').set('Cookie', `token=${userToken};`)
        .send({ ...tripRequest, tripType: 'Multi-leg' });
      expect(response).to.have.status(400);
      expect(response.body.status).to.equal('fail');
      expect(response.body.error.message).to.equal('A Multi-city trip must have a mininmum of 2 and a maximum of 5 trip details');
    });
    it('should throw a 500 error if something went wrong', async () => {
      const req = {
        body: {}
      };
      const mockResponse = () => {
        const res = {};
        res.status = sinon.stub().returns(res);
        res.json = sinon.stub().returns(res);
        return res;
      };
      const res = mockResponse();
      sinon.stub(RequestService, 'createTripRequest').throws('Failed to create request. Try again');
      await RequestController.tripRequest(req, res);
      expect(res.status).to.have.been.calledWith(500);
    });
  });
});
