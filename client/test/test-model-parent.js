const chai = require('chai')
const expect = require('chai').expect
const modelModule = require('../src/Model')
const { PAGES } = require('../src/Update')

chai.should();
chai.expect();

describe('[INIT MODEL - Parent]', () => {

  it('Starting with LOGIN page works', (done) => {
    const response = modelModule.initModel('https://baseurl/login')
    response.should.be.an('array')
    response.should.have.lengthOf(2)
    const [ model, commands ] = response;
    model.should.be.an('object')
    console.log(model)
    model.page.should.equal(PAGES.LOGIN)
    model.should.have.all.keys('page', 'po_master', 'po_detail', 'login')
    expect(commands).to.be.null
    done()
  })

  it('Starting with PO_DETAIL page works', (done) => {
    const response = modelModule.initModel('https://baseurl/podetail/0000021')
    response.should.be.an('array')
    response.should.have.lengthOf(2)
    const [ model, command ] = response;
    model.should.be.an('object')
    command.should.be.an('object')
    model.page.should.equal(PAGES.PO_DETAIL)
    model.should.have.all.keys('page', 'po_master', 'po_detail', 'login')
    expect(command).not.to.be.null
    command.should.have.all.keys('request', 'successMsg', 'errorMsg', 'httpStartMsg', 'originalMsg')
    command.originalMsg.should.be.an('object')
    command.originalMsg.msg.should.equal('RETRIEVE_PURCHASE_ORDER')
    command.originalMsg.id.should.equal('0000021')
    done()
  })

  it('Starting with PO_MASTER page works', (done) => {
    const response = modelModule.initModel('https://baseurl/pomaster')
    response.should.be.an('array')
    response.should.have.lengthOf(2)
    const [ model, command ] = response;
    model.should.be.an('object')
    command.should.be.an('object')
    model.page.should.equal(PAGES.PO_MASTER)
    model.should.have.all.keys('page', 'po_master', 'po_detail', 'login')
    expect(command).not.to.be.null
    command.should.have.all.keys('request', 'successMsg', 'errorMsg', 'httpStartMsg', 'originalMsg')
    command.originalMsg.should.be.an('object')
    command.originalMsg.msg.should.equal('REFRESH')
    done()
  })

})
