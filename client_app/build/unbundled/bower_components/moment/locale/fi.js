!function(e,u){"object"==typeof exports&&"undefined"!=typeof module&&"function"==typeof require?u(require("../moment")):"function"==typeof define&&define.amd?define(["moment"],u):u(e.moment)}(this,function(e){"use strict";function u(e,u,t,a){var i="";switch(t){case"s":return a?"muutaman sekunnin":"muutama sekunti";case"m":return a?"minuutin":"minuutti";case"mm":i=a?"minuutin":"minuuttia";break;case"h":return a?"tunnin":"tunti";case"hh":i=a?"tunnin":"tuntia";break;case"d":return a?"päivän":"päivä";case"dd":i=a?"päivän":"päivää";break;case"M":return a?"kuukauden":"kuukausi";case"MM":i=a?"kuukauden":"kuukautta";break;case"y":return a?"vuoden":"vuosi";case"yy":i=a?"vuoden":"vuotta"}return i=n(e,a)+" "+i}function n(e,u){return e<10?u?a[e]:t[e]:e}var t="nolla yksi kaksi kolme neljä viisi kuusi seitsemän kahdeksan yhdeksän".split(" "),a=["nolla","yhden","kahden","kolmen","neljän","viiden","kuuden",t[7],t[8],t[9]],i=e.defineLocale("fi",{months:"tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesäkuu_heinäkuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu".split("_"),monthsShort:"tammi_helmi_maalis_huhti_touko_kesä_heinä_elo_syys_loka_marras_joulu".split("_"),weekdays:"sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai".split("_"),weekdaysShort:"su_ma_ti_ke_to_pe_la".split("_"),weekdaysMin:"su_ma_ti_ke_to_pe_la".split("_"),longDateFormat:{LT:"HH.mm",LTS:"HH.mm.ss",L:"DD.MM.YYYY",LL:"Do MMMM[ta] YYYY",LLL:"Do MMMM[ta] YYYY, [klo] HH.mm",LLLL:"dddd, Do MMMM[ta] YYYY, [klo] HH.mm",l:"D.M.YYYY",ll:"Do MMM YYYY",lll:"Do MMM YYYY, [klo] HH.mm",llll:"ddd, Do MMM YYYY, [klo] HH.mm"},calendar:{sameDay:"[tänään] [klo] LT",nextDay:"[huomenna] [klo] LT",nextWeek:"dddd [klo] LT",lastDay:"[eilen] [klo] LT",lastWeek:"[viime] dddd[na] [klo] LT",sameElse:"L"},relativeTime:{future:"%s päästä",past:"%s sitten",s:u,m:u,mm:u,h:u,hh:u,d:u,dd:u,M:u,MM:u,y:u,yy:u},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}});return i});