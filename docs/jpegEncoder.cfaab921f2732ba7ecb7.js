"use strict";(self.webpackChunkprism_process=self.webpackChunkprism_process||[]).push([[315],{653:(r,a,o)=>{o.d(a,{A:()=>e});var n=o(287).hp;function f(r){Math.round;var a,o,f,e,t,v=Math.floor,i=new Array(64),c=new Array(64),u=new Array(64),h=new Array(64),w=new Array(65535),s=new Array(65535),y=new Array(64),A=new Array(64),d=[],g=0,p=7,l=new Array(64),m=new Array(64),C=new Array(64),k=new Array(256),M=new Array(2048),_=[0,1,5,6,14,15,27,28,2,4,7,13,16,26,29,42,3,8,12,17,25,30,41,43,9,11,18,24,31,40,44,53,10,19,23,32,39,45,52,54,20,22,33,38,46,51,55,60,21,34,37,47,50,56,59,61,35,36,48,49,57,58,62,63],D=[0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0],T=[0,1,2,3,4,5,6,7,8,9,10,11],b=[0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,125],x=[1,2,3,0,4,17,5,18,33,49,65,6,19,81,97,7,34,113,20,50,129,145,161,8,35,66,177,193,21,82,209,240,36,51,98,114,130,9,10,22,23,24,25,26,37,38,39,40,41,42,52,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,225,226,227,228,229,230,231,232,233,234,241,242,243,244,245,246,247,248,249,250],B=[0,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0],E=[0,1,2,3,4,5,6,7,8,9,10,11],N=[0,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,119],S=[0,1,2,3,17,4,5,33,49,6,18,65,81,7,97,113,19,34,50,129,8,20,66,145,161,177,193,9,35,51,82,240,21,98,114,209,10,22,36,52,225,37,241,23,24,25,26,38,39,40,41,42,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,130,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,226,227,228,229,230,231,232,233,234,242,243,244,245,246,247,248,249,250];function j(r,a){for(var o=0,n=0,f=new Array,e=1;e<=16;e++){for(var t=1;t<=r[e];t++)f[a[n]]=[],f[a[n]][0]=o,f[a[n]][1]=e,n++,o++;o*=2}return f}function q(r){for(var a=r[0],o=r[1]-1;o>=0;)a&1<<o&&(g|=1<<p),o--,--p<0&&(255==g?(z(255),z(0)):z(g),p=7,g=0)}function z(r){d.push(r)}function F(r){z(r>>8&255),z(255&r)}function G(r,a,o,n,f){for(var e,t=f[0],v=f[240],i=function(r,a){var o,n,f,e,t,v,i,c,u,h,w=0;for(u=0;u<8;++u){o=r[w],n=r[w+1],f=r[w+2],e=r[w+3],t=r[w+4],v=r[w+5],i=r[w+6];var s=o+(c=r[w+7]),A=o-c,d=n+i,g=n-i,p=f+v,l=f-v,m=e+t,C=e-t,k=s+m,M=s-m,_=d+p,D=d-p;r[w]=k+_,r[w+4]=k-_;var T=.707106781*(D+M);r[w+2]=M+T,r[w+6]=M-T;var b=.382683433*((k=C+l)-(D=g+A)),x=.5411961*k+b,B=1.306562965*D+b,E=.707106781*(_=l+g),N=A+E,S=A-E;r[w+5]=S+x,r[w+3]=S-x,r[w+1]=N+B,r[w+7]=N-B,w+=8}for(w=0,u=0;u<8;++u){o=r[w],n=r[w+8],f=r[w+16],e=r[w+24],t=r[w+32],v=r[w+40],i=r[w+48];var j=o+(c=r[w+56]),q=o-c,z=n+i,F=n-i,G=f+v,H=f-v,I=e+t,J=e-t,K=j+I,L=j-I,O=z+G,P=z-G;r[w]=K+O,r[w+32]=K-O;var Q=.707106781*(P+L);r[w+16]=L+Q,r[w+48]=L-Q;var R=.382683433*((K=J+H)-(P=F+q)),U=.5411961*K+R,V=1.306562965*P+R,W=.707106781*(O=H+F),X=q+W,Y=q-W;r[w+40]=Y+U,r[w+24]=Y-U,r[w+8]=X+V,r[w+56]=X-V,w++}for(u=0;u<64;++u)h=r[u]*a[u],y[u]=h>0?h+.5|0:h-.5|0;return y}(r,a),c=0;c<64;++c)A[_[c]]=i[c];var u=A[0]-o;o=A[0],0==u?q(n[0]):(q(n[s[e=32767+u]]),q(w[e]));for(var h=63;h>0&&0==A[h];h--);if(0==h)return q(t),o;for(var d,g=1;g<=h;){for(var p=g;0==A[g]&&g<=h;++g);var l=g-p;if(l>=16){d=l>>4;for(var m=1;m<=d;++m)q(v);l&=15}e=32767+A[g],q(f[(l<<4)+s[e]]),q(w[e]),g++}return 63!=h&&q(t),o}function H(r){if(r<=0&&(r=1),r>100&&(r=100),t!=r){(function(r){for(var a=[16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99],o=0;o<64;o++){var n=v((a[o]*r+50)/100);n<1?n=1:n>255&&(n=255),i[_[o]]=n}for(var f=[17,18,24,47,99,99,99,99,18,21,26,66,99,99,99,99,24,26,56,99,99,99,99,99,47,66,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99],e=0;e<64;e++){var t=v((f[e]*r+50)/100);t<1?t=1:t>255&&(t=255),c[_[e]]=t}for(var w=[1,1.387039845,1.306562965,1.175875602,1,.785694958,.5411961,.275899379],s=0,y=0;y<8;y++)for(var A=0;A<8;A++)u[s]=1/(i[_[s]]*w[y]*w[A]*8),h[s]=1/(c[_[s]]*w[y]*w[A]*8),s++})(r<50?Math.floor(5e3/r):Math.floor(200-2*r)),t=r}}this.encode=function(r,t){var v;(new Date).getTime();t&&H(t),d=new Array,g=0,p=7,F(65496),F(65504),F(16),z(74),z(70),z(73),z(70),z(0),z(1),z(1),z(0),F(1),F(1),z(0),z(0),void 0!==(v=r.comments)&&v.constructor===Array&&v.forEach((function(r){if("string"==typeof r){F(65534);var a,o=r.length;for(F(o+2),a=0;a<o;a++)z(r.charCodeAt(a))}})),function(r){if(r){F(65505),69===r[0]&&120===r[1]&&105===r[2]&&102===r[3]?F(r.length+2):(F(r.length+5+2),z(69),z(120),z(105),z(102),z(0));for(var a=0;a<r.length;a++)z(r[a])}}(r.exifBuffer),function(){F(65499),F(132),z(0);for(var r=0;r<64;r++)z(i[r]);z(1);for(var a=0;a<64;a++)z(c[a])}(),function(r,a){F(65472),F(17),z(8),F(a),F(r),z(3),z(1),z(17),z(0),z(2),z(17),z(1),z(3),z(17),z(1)}(r.width,r.height),function(){F(65476),F(418),z(0);for(var r=0;r<16;r++)z(D[r+1]);for(var a=0;a<=11;a++)z(T[a]);z(16);for(var o=0;o<16;o++)z(b[o+1]);for(var n=0;n<=161;n++)z(x[n]);z(1);for(var f=0;f<16;f++)z(B[f+1]);for(var e=0;e<=11;e++)z(E[e]);z(17);for(var t=0;t<16;t++)z(N[t+1]);for(var v=0;v<=161;v++)z(S[v])}(),F(65498),F(12),z(3),z(1),z(0),z(2),z(17),z(3),z(17),z(0),z(63),z(0);var w=0,s=0,y=0;g=0,p=7,this.encode.displayName="_encode_";for(var A,k,_,j,I,J,K,L,O,P=r.data,Q=r.width,R=r.height,U=4*Q,V=0;V<R;){for(A=0;A<U;){for(J=I=U*V+A,K=-1,L=0,O=0;O<64;O++)J=I+(L=O>>3)*U+(K=4*(7&O)),V+L>=R&&(J-=U*(V+1+L-R)),A+K>=U&&(J-=A+K-U+4),k=P[J++],_=P[J++],j=P[J++],l[O]=(M[k]+M[_+256|0]+M[j+512|0]>>16)-128,m[O]=(M[k+768|0]+M[_+1024|0]+M[j+1280|0]>>16)-128,C[O]=(M[k+1280|0]+M[_+1536|0]+M[j+1792|0]>>16)-128;w=G(l,u,w,a,f),s=G(m,h,s,o,e),y=G(C,h,y,o,e),A+=32}V+=8}if(p>=0){var W=[];W[1]=p+1,W[0]=(1<<p+1)-1,q(W)}return F(65497),n.from(d)},function(){(new Date).getTime();r||(r=50),function(){for(var r=String.fromCharCode,a=0;a<256;a++)k[a]=r(a)}(),a=j(D,T),o=j(B,E),f=j(b,x),e=j(N,S),function(){for(var r=1,a=2,o=1;o<=15;o++){for(var n=r;n<a;n++)s[32767+n]=o,w[32767+n]=[],w[32767+n][1]=o,w[32767+n][0]=n;for(var f=-(a-1);f<=-r;f++)s[32767+f]=o,w[32767+f]=[],w[32767+f][1]=o,w[32767+f][0]=a-1+f;r<<=1,a<<=1}}(),function(){for(var r=0;r<256;r++)M[r]=19595*r,M[r+256|0]=38470*r,M[r+512|0]=7471*r+32768,M[r+768|0]=-11059*r,M[r+1024|0]=-21709*r,M[r+1280|0]=32768*r+8421375,M[r+1536|0]=-27439*r,M[r+1792|0]=-5329*r}(),H(r),(new Date).getTime()}()}const e=f}}]);