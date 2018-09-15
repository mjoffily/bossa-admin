const chai = require('chai')
const expect = require('chai').expect
const loginUpdate = require('../src/login/Update')
const loginModel = require('../src/login/Model')

chai.should();
chai.expect();

describe('[Client - Login Test Cases]', () => {
  beforeEach(() => {window.sessionStorage = {}})

  it('Should set block to true when httpStartMsg is handled', (done) => {
    const msg = loginUpdate.httpStartMsg;
    const model = loginModel.initModel()[0]
    const result = loginUpdate.update(msg, model)
    result.should.be.a('array')
    result.should.have.lengthOf(3)
    const [ modifiedModel, commands, asyncMessages ] = result;
    modifiedModel.should.have.property('block')
    modifiedModel.block.should.be.true
    expect(commands).to.be.null
    expect(asyncMessages).to.be.null
    done()
  })

  it('Should set userid in model when inputUserIdMsg is handled', (done) => {
    const userid = "myuser"
    const msg = loginUpdate.inputUserIdMsg(userid);
    const model = loginModel.initModel()[0]
    const result = loginUpdate.update(msg, model)
    result.should.be.a('array')
    result.should.have.lengthOf(3)
    const [ modifiedModel, commands, asyncMessages ] = result;
    modifiedModel.userid.should.equal(userid)
    modifiedModel.should.have.property('block')
    modifiedModel.should.have.property('password')
    modifiedModel.block.should.be.false
    modifiedModel.password.should.equal('')
    expect(commands).to.be.null
    expect(asyncMessages).to.be.null
    done()
  })

  it('Should set password in model when inputPasswordMsg is handled', (done) => {
    const pwd = "mypass"
    const msg = loginUpdate.inputPasswordMsg(pwd);
    const model = loginModel.initModel()[0]
    const result = loginUpdate.update(msg, model)
    result.should.be.a('array')
    result.should.have.lengthOf(3)
    const [ modifiedModel, commands, asyncMessages ] = result;
    modifiedModel.should.have.property('userid')
    modifiedModel.should.have.property('block')
    modifiedModel.should.have.property('password')
    modifiedModel.password.should.equal(pwd)
    modifiedModel.block.should.be.false
    modifiedModel.userid.should.equal('')
    expect(commands).to.be.null
    expect(asyncMessages).to.be.null
    done()
  })
  
  
  it('Should redirect to default page when login is successful and no redirect override is provided', (done) => {
    const data = {data: {data: {status: true, token: 'my token'}}}
    const msg = loginUpdate.httpLoginVerificationExecutedMsg(data) 
    const model = loginModel.initModel()[0]
    const result = loginUpdate.update(msg, model)
    const [ modifiedModel, commands, asyncMessages ] = result;
    window.sessionStorage.should.be.an('object')
    window.sessionStorage.should.not.be.empty
    asyncMessages.should.be.an('array')
    asyncMessages.should.have.lengthOf(2)
    const [msg1, msg2] = asyncMessages
    msg1.should.have.all.keys('type', 'page', 'msg')
    msg1.type.should.be.equal('NAVIGATE_TO_PAGE')
    msg1.page.should.be.equal('PO_MASTER')
    expect(msg1.msg).to.be.undefined
    msg2.should.be.an('function')
    const msgObj = msg2()
    msgObj.should.be.an('object')
    msgObj.should.have.property('msg')
    msgObj.msg.should.be.equal('REFRESH')
    done()
  })

  it('Should redirect to original page when login is successful and redirect override is provided', (done) => {
    // prep the redirect msg
    const redirectToPage = 'PO_DETAIL'
    const msgToRedirect = { type: 'original message for testing'}
    const redirect_to = loginUpdate.redirectToMsg(redirectToPage, msgToRedirect)
    // prep the model and msg
    const data = {data: {data: {status: true, token: 'my token'}}}
    const model = { ...loginModel.initModel()[0], redirect_to }
    console.log(model)
    const msg = loginUpdate.httpLoginVerificationExecutedMsg(data)
    
    // call method under test
    const result = loginUpdate.update(msg, model)
    
    const [ modifiedModel, commands, asyncMessages ] = result;
    asyncMessages.should.be.an('array')
    asyncMessages.should.have.lengthOf(2)
    const [msg1, msg2] = asyncMessages
    msg1.should.have.all.keys('type', 'page', 'msg')
    msg1.type.should.be.equal('NAVIGATE_TO_PAGE')
    msg1.page.should.be.equal(redirectToPage)
    msg2.should.be.an('object')
    msg2.should.have.property('type')
    msg2.type.should.be.equal('original message for testing')
    done()
  })
})
