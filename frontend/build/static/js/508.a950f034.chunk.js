(self.webpackChunkmulti_sig_wallet_frontend=self.webpackChunkmulti_sig_wallet_frontend||[]).push([[508,848],{80834:function(r,n,e){"use strict";e.r(n),e.d(n,{getED25519Key:function(){return u}});var t=e(93433),a=e(80889),f=e.n(a),i=e(40918).Buffer,o=f().lowlevel;function u(r){var n;n="string"===typeof r?i.from(r,"hex"):r;var e=new Uint8Array(64),a=[o.gf(),o.gf(),o.gf(),o.gf()],f=new Uint8Array([].concat((0,t.Z)(new Uint8Array(n)),(0,t.Z)(new Uint8Array(32)))),u=new Uint8Array(32);o.crypto_hash(e,f,32),e[0]&=248,e[31]&=127,e[31]|=64,o.scalarbase(a,e),o.pack(u,a);for(var c=0;c<32;c+=1)f[c+32]=u[c];return{sk:i.from(f),pk:i.from(u)}}},78848:function(){}}]);