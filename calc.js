(function(root){
const defaults={mode:'wq',catchment:500,coefficient:0.95,k:1000,length:5,width:2,pond:150,media:500,transition:100,drain:250,storage:450,soil:2,target:8};
function calculate(p){
 for(const key of Object.keys(defaults)){if(key==='mode')continue;if(!Number.isFinite(p[key]))throw Error('Enter complete, valid numbers (请输入完整有效数字)');}
 if(!['wq','smaf1','smaf2'].includes(p.mode))throw Error('Select a design mode (请选择设计模式)');
 for(const key of ['catchment','k','length','width'])if(p[key]<=0)throw Error('Area, dimensions and permeability must be positive (面积、长宽和渗透率必须大于 0)');
 for(const key of ['pond','media','transition','drain','storage','soil','target'])if(p[key]<0)throw Error('Depths, soil rate and target volume cannot be negative (不能为负数)');
 if(p.coefficient<0||p.coefficient>1)throw Error('Runoff coefficient must be 0–1 (径流系数应在 0–1 之间)');
 if(p.k>1000)throw Error('GD01 media permeability limit is 1000 mm/h (介质渗透率上限)');
 const hydro=p.mode!=='wq',a=p.length*p.width,q=.01*p.catchment*p.coefficient,ratio=p.mode==='smaf1'?.05:p.mode==='smaf2'?.035:.02;
 const pond=a*p.pond/1000,media=a*(p.media+p.transition)/1000*.3,drain=a*p.drain/1000*.35,storage=hydro?a*p.storage/1000*.35:0;
 const soil=Math.max(2,p.soil),infil=hydro?Math.min(storage,a*soil/1000*72):0,et=hydro?a*.009:0,retention=infil+et,detention=pond+media+drain;
 const retTarget=p.catchment*.005,unitDet=p.pond/1000+(p.media+p.transition)/1000*.3+p.drain/1000*.35,unitRet=Math.min(p.storage/1000*.35,soil/1000*72)+.009;
 const minArea=hydro?Math.max(ratio*p.catchment,p.target/(unitDet||1e-30),retTarget/unitRet):Math.max(.02*p.catchment,q/(.5*p.k/1000));
 const checks=[['Footprint (占地面积)',a>=minArea-1e-9,`${a.toFixed(2)} / ${minArea.toFixed(2)} m²`],['Ponding depth (表面蓄水深度)',p.pond>=(p.mode==='smaf1'?200:p.mode==='smaf2'?150:100),`${p.pond} mm`],['Media depth (种植介质厚度)',p.media>=500,`${p.media} / ≥500 mm`],['Transition depth (过渡层厚度)',p.transition===100,`${p.transition} / 100 mm`],['Drainage depth (排水层厚度)',p.drain>=200,`${p.drain} / ≥200 mm`]];
 if(hydro)checks.push(['Media K (介质渗透率)',p.k>=50&&p.k<=300,`${p.k} / 50–300 mm/h`],['Storage layer (底部蓄水层)',p.storage>=450,`${p.storage} / ≥450 mm`],['Detention volume (滞水容积)',detention>=p.target,`${detention.toFixed(2)} / ${p.target.toFixed(2)} m³`],['Retention volume (蓄水容积)',retention>=retTarget,`${retention.toFixed(2)} / ${retTarget.toFixed(2)} m³`]);
 return {a,q,pond,media,drain,storage,infil,et,retention,detention,minArea,retTarget,hydro,checks,soil,depth:(p.pond+p.media+p.transition+p.drain+(hydro?p.storage:0))/1000};
}
root.RainCalc={defaults,calculate};if(typeof module!=='undefined')module.exports=root.RainCalc;
})(globalThis);
