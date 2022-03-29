const expect= require('chai').expect;
const authMiddleware = require('../middleware/is-auth');

describe('Auth Middleware', ()=>{

    it('Should throw error if no Authorization preset', ()=>{
        const req = {
            get: function(){
                return null;    
            }
        }
        expect(authMiddleware.bind(this, req, {}, {}, ()=>{})).to.throw('Not Authenticated');
    })
    
    it('Should throw error if Authorization is not set corretctly', ()=>{
        const req = {
            get: function(){
                return 'xxx';    
            }
        }
        expect(authMiddleware.bind(this, req, {}, {}, ()=>{})).to.throw('jwt must be provided');
    })

    it('Should throw error if token can not be verified', ()=>{
        const req = {
            get: function(){
                return 'Bearer xxx';    
            }
        }
        expect(authMiddleware.bind(this, req, {}, {}, ()=>{})).to.throw();
    })

})
