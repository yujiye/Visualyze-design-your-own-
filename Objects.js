function InfoSong() {
	this.avatar;
	this.title;
	this.medialink;
	
	this.lyrics;
	this.lyricNow = '';
	this.lyricNext ='';
	this.index = 0;

	this.updateLyric = function(){
		if(this.lyrics){
			var found = false;
			var index = 0;
			for(var i = 1; i < this.lyrics.length; i++){
				if(this.lyrics[i][0] == '[' && this.lyrics[i][9] == ']' 
				&& this.lyrics[i][3] == ':' && this.lyrics[i][6] == '.'){
					var timelyric = '';
					for(var j = 2; j <= 8; j++)
						timelyric += this.lyrics[i][j];
				
					if(time(true) <= timelyric){
						found = true;
						index = i-1;
						break;					
					}
				}
			}
			if(found && this.index != index){
				this.index = index;
				this.lyricNow = '';
				for(var i = 10; i < this.lyrics[index].length; i++)
					this.lyricNow += this.lyrics[index][i];
				
				this.lyricNext = '';
				if(this.lyrics[index+1] != null){
					for(var i = 10; i < this.lyrics[index+1].length; i++)
						this.lyricNext += this.lyrics[index+1][i];
				}
			}
		}
	}

	this.updateData = function(newData){
		this.medialink = 'https:'+ newData.data.source[128];
		this.title = newData.data.title + " - " + newData.data.artists_names;
		this.avatar = loadImage(newData.data.thumbnail);
		console.log(this.title+"\n"+this.medialink);
		console.log("avatar\n"+newData.data.thumbnail);
		
		this.lyrics = loadStrings(newData.data.lyric);
	}

	// for offline file (Demo)
	this.urls = [];
	this.setTitleFromFile = function(fileName){
		this.title = fileName.substring(0, fileName.length-4);
		this.avatar = null;
		this.medialink = null; // file offline 
		this.lyrics = null;
		this.lyricNow = '';
		this.lyricNext ='';
	}

	this.addUrl = function(url){
		this.urls.push(url);
	}
}

//============     Text Box      ==================
function textBox(x, y, w, h, textInside, typeIn){
	this.objectType = typeIn;
	this.pos = createVector(x, y);
	this.size = createVector(w, h);
	this.textInside = textInside;
	this.id = objects.length;
	this.boxcontain = new BoxContain(this);

	this.show = function(){
		strokeWeight(1);
		textSize(this.size.y);
		noStroke();
		if(typeIn == 'title' || typeIn == 'text'){
			if(typeIn == 'title'){
				this.textInside = info.title;
				fill(VisualizeGui.titleColor);
			} else fill(VisualizeGui.textColor);
			text(this.textInside, this.pos.x, this.pos.y);
		
		} else if(typeIn == 'time'){
			fill(255);
			text(time(false), this.pos.x, this.pos.y);
		
		} else if(typeIn == 'lyric'){
			info.updateLyric();
			fill(VisualizeGui.lyricColor);
			text(info.lyricNow, this.pos.x, this.pos.y);
			fill(VisualizeGui.lyricColor2);
			textSize(this.size.y-3);
			text(info.lyricNext, this.pos.x, this.pos.y+this.size.y+10);
		}
		textSize(20); // set textSize to default
	}

	// when delete one object , ID will change
	this.updateID = function(newID){
		this.id = newID;
	}

	this.setPosition = function(x, y){
		this.pos = createVector(x, y);
	}

	this.setSize = function(w, h){
		this.size = createVector(w, h);
	}

	this.run = function(){
		this.show();

		if(designMode)
			this.boxcontain.show();
	}
}

//============     Buttons      ================
function ButtonShape(x, y, w, h, name, funcMouseOn, whenClick) {
	this.objectType = 'ButtonShape';
	this.pos = createVector(x, y);
	this.size = createVector(w, h);
	this.id = objects.length;
	this.name = name;
	this.boxcontain = new BoxContain(this);

	this.clicked = function(){
		if(isPointInsideRect2(v(mouseX, mouseY), this.pos, this.size)){
			whenClick();
		}
	}

	this.show = function(){
		// show current state if this button is Play/Pause button
		if(this.name != 'Next' & this.name != 'Pre'){
			if(myAudio.elt.networkState == 1 && myAudio.elt.readyState == 4) 
			{
				if(myAudio.elt.paused)
					this.name = "Play";
				else this.name = "Pause";
			}
			else {
				var loading = "Loading";
				var timeAnimation = (millis()/200)%(loading.length);
				var textAnimation = "";
				for(var i = 0; i < timeAnimation; i++){
					textAnimation += loading[i];
				}
				this.name = textAnimation;
			}
		}
		// show button shape
		if(!designMode && isPointInsideRect2(v(mouseX, mouseY), this.pos, this.size)){
			if(funcMouseOn)
				funcMouseOn();
			fill(color('hsba(200, 100%, 100%, 0.4)'));
		}
		else noFill();

		stroke(255);
		strokeWeight(1);
		rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

		textSize(this.size.y/2);
		if(this.name == 'Next' || this.name == 'Pre'){
			fill(255);
			noStroke();
		}
 		text(this.name, this.pos.x, this.pos.y);
		textSize(20);
	}

	// when delete one object , ID will change
	this.updateID = function(newID){
		this.id = newID;
	}

	this.setPosition = function(x, y){
		this.pos = createVector(x, y);
	}

	this.setSize = function(w, h){
		this.size = createVector(w, h);
	}

	this.run = function(){
		this.show();

		if(designMode)
			this.boxcontain.show();
	}
}

//============     Visualize Graph      =================
function AmplitudeGraph(x, y, w, h, type) {
	this.objectType = 'AmplitudeGraph';
	this.pos = createVector(x, y);
	this.size = createVector(w, h);
	this.id = objects.length;
	this.type = type;

	this.boxcontain = new BoxContain(this);

	this.show = function(){
		var r = map(ampLevel, 0, 0.5, 0, this.size.y);
		
		fill(255-map(ampLevel, 0, 0.5, 0, 255), 255, 255);
		noStroke();

		switch(this.type){
			case "singleRect" : 
				rect(this.pos.x, this.pos.y-r/2+this.size.y/2, this.size.x, r);
				break;

			case "singleRect_Ngang":
				var rNgang = map(ampLevel, 0, 0.5, 0, this.size.x);
				rect(this.pos.x-rNgang/2+this.size.x/2, this.pos.y, rNgang, this.size.y);
				break;

			case "circle" :
				ellipse(this.pos.x, this.pos.y, r, r);
				break;

			case "lineGraph" :
				if(! this.graph)
					this.graph = [];
				this.graph.push(ampLevel*1.5);
				while(this.graph.length > this.size.x/5)
					this.graph.splice(0, 1);

				strokeWeight(3);
				noFill();
				var dis = this.size.x/(this.size.x/5);
				var y, y2;
				for(var i = 0; i < this.graph.length-1; i++){
					y = map(this.graph[i], 0, 1, -this.size.y/2, this.size.y/2);
					y2 = map(this.graph[i+1], 0, 1, -this.size.y/2, this.size.y/2);

					stroke(map(this.graph[i], 0, 0.5, 255, 0), 255, 255);
					line(i*dis+(this.pos.x-this.size.x/2), this.pos.y-y, 
						(i+1)*dis+(this.pos.x-this.size.x/2), this.pos.y-y2);
				}
				// circle at end graph
				fill(255);
				ellipse(this.pos.x+this.size.x/2, this.pos.y-y, 12, 12);
				break;

		}
	}

	// when delete one object , ID will change
	this.updateID = function(newID){
		this.id = newID;
	}

	this.setPosition = function(x, y){
		this.pos = createVector(x, y);
	}

	this.setSize = function(w, h){
		this.size = createVector(w, h);
	}

	this.run = function(){
		if(ampLevel)
			this.show();

		if(designMode)
			this.boxcontain.show();
	}
}

function fftGraph(x, y, w, h, type){
	this.objectType = 'fftGraph';
	this.pos = createVector(x, y);
	this.size = createVector(w, h);
	this.type = type;
	this.id = objects.length;

	this.boxcontain = new BoxContain(this);

	this.show = function(){
		switch(this.type){
			case "center":
				var barWidth = this.size.x/(fftAnalyze.length);
				strokeWeight(abs(barWidth));

				for(var i = 0; i < fftAnalyze.length; i++){
					var len = map(fftAnalyze[i], 0, 255, 0, this.size.y);
					
					stroke(color('hsba('+ (255-fftAnalyze[i]) +', 100%, 100%, 0.7)'));
					var x1 = i*barWidth+(this.pos.x-this.size.x/2)+barWidth/2;
					var y1 = this.pos.y;
					line(x1, y1-len/2-1, x1, y1+len/2);
				}
				break;

			case "center noColor":
				var barWidth = this.size.x/(fftAnalyze.length);
				stroke(255);
				strokeWeight(2);

				for(var i = 0; i < fftAnalyze.length; i++){
					var len = map(fftAnalyze[i], 0, 255, 0, this.size.y);
					
					var x1 = i*barWidth+(this.pos.x-this.size.x/2)+barWidth/2;
					var y1 = this.pos.y;
					line(x1, y1-len/2-1, x1, y1+len/2);
				}
				break;

			case "bottom":
				var y;
				var barWidth = this.size.x/(fftAnalyze.length);
				strokeWeight(abs(barWidth));

				for(var i = 0; i < fftAnalyze.length; i++){
					y = map(fftAnalyze[i], 0, 255, 0, this.size.y);

					stroke(color('hsba('+ (255-fftAnalyze[i]) +', 100%, 100%, 0.7)'));
					var x1 = i*barWidth+(this.pos.x-this.size.x/2)+barWidth/2;
					var y1 = this.pos.y+this.size.y/2-y;
					var x2 = x1;
					var y2 = this.pos.y+this.size.y/2+1;
					line(x1, y1, x2, y2);
				}
				break;

			case "bottom noColor":
				var y;
				var barWidth = this.size.x/(fftAnalyze.length);
				stroke(255);
				strokeWeight(2);

				for(var i = 0; i < fftAnalyze.length; i++){
					y = map(fftAnalyze[i], 0, 255, 0, this.size.y);

					var x1 = i*barWidth+(this.pos.x-this.size.x/2)+barWidth/2;
					var y1 = this.pos.y+this.size.y/2-y;
					var x2 = x1;
					var y2 = this.pos.y+this.size.y/2+1;
					line(x1, y1, x2, y2);
				}
				break;

			case "circle":
				var y;
				var len = fftAnalyze.length;
				var barWidth = this.size.x/len;
				stroke(100);
				
				noFill();
				for(var i = 0; i < len; i+=2){
					y = this.size.x/5+map(fftAnalyze[i], 0, 255, 0, this.size.y)*0.2;
					strokeWeight(6);
					point(this.pos.x + y*cos(180/len*i), 
							this.pos.y + y*sin(180/len*i));
					point(this.pos.x + y*cos(180/len*i+180), 
							this.pos.y + y*sin(180/len*i+180));

					strokeWeight(2);
					stroke(color('hsba('+ (255-fftAnalyze[i]) +', 100%, 100%, 0.7)'));
					line(this.pos.x+(this.size.x/3+ampLevel*50)*cos(180/len*i),
							this.pos.y+(this.size.x/3+ampLevel*50)*sin(180/len*i),
							this.pos.x + y*cos(180/len*i), 
							this.pos.y + y*sin(180/len*i));
					line(this.pos.x+(this.size.x/3+ampLevel*50)*cos(180/len*i+180),
							this.pos.y+(this.size.x/3+ampLevel*50)*sin(180/len*i+180),
							this.pos.x + y*cos(180/len*i+180), 
							this.pos.y + y*sin(180/len*i+180));
				}

				ellipse(this.pos.x, this.pos.y, this.size.x/3+ampLevel*100, this.size.x/3+ampLevel*100);
				
				break;

			case "waveform":
				var y;
				var barWidth = this.size.x/(fftWave.length);
				stroke(255);
				strokeWeight(2);
				noFill();

				beginShape();
				for (var i = 0; i< fftWave.length; i++){
					var x = map(i, 0, fftWave.length, this.pos.x-this.size.x/2, this.pos.x+this.size.x/2);
					var y = map(fftWave[i], -1, 1, this.pos.y+this.size.y/2, this.pos.y-this.size.y/2);
					vertex(x,y);
				}
				endShape();
				break;
		}
	}

	// when delete one object , ID will change
	this.updateID = function(newID){
		this.id = newID;
	}

	this.setPosition = function(x, y){
		this.pos = createVector(x, y);
	}

	this.setSize = function(w, h){
		this.size = createVector(w, h);
	}

	this.run = function(){
		if(fftAnalyze)
			this.show();

		if(designMode)
			this.boxcontain.show();
	}
}

//=============    Id Zing mp3     ==============
var IdZing = [
		{
			"name": "AnhGhetLamBanem",
			"id"  : "LmxGTkmNlhhsCkGtmybHkGtkQFQvxRmFc"
		},
		{
			"name": "Attention",
			"id"  : "LmJHtLmsCFFHdBStnyDmZntZpFzQmCRbF"
		},

		{
			"name": "Buon Cua Anh",
			"id"  : "LmxGyZnNCzXVidAymybHZnTLpFzpmzuNp"
		},

		{
			"name": "Co Em Cho",
			"id"  : "kmJmtZHaXDvalmktmtFGZHyZQFlQHhzmJ"
		},

		{
			"name": "Co gai 1m52",
			"id"  : "ZncnyZHsJmWSmbhTGTDmkmtkpvSWGCNBA"
		},

		{
			"name": "Cung Anh",
			"id"  : "LHxGykHNcHLHFSHynyvnkmtkQvSWGpDui"
		},

		{
			"name": "Di Ve Dau",
			"id"  : "LnxHyZmaWcHaZZAyHyFnLGyZQbzWnBduS"
		},

		{
			"name": "Dieu Anh Biet",
			"id"  : "LmJHTkmspsNbQQLtGyvGZnykpvSWmCvxi"
		},

		{
			"name": "Faded",
			"id"  : "ZHxnyLmsWlpcNZBTGyvmZGTZWbzpnsFhL"
		},

		{
			"name": "Friends",
			"id"  : "knJGyZGacmWQZZLTmyFHLHyLQbzpmpspd"
		},

		{
			"name": "Ghen",
			"id"  : "kmxmyLmaCFgGaQitmyDmLmtLQFzQHQVkk"
		},

		{
			"name": "How Long",
			"id"  : "kmJHyZnshduJNNHyHtbGkmtkQDSWHdSxB"
		},

		{
			"name": "Tuy Am",
			"id"  : "kmcmyLmaCBsQAdFyHTbnkGTZpFzzNCmkc" 
		},

		{
			"name": "Khi Nguoi Minh Yeu Khoc",
			"id"  : "ZGcmyLnaWzQLczhTmyDnLGTkpbzAkLmZk" 
		},

		{
			"name": "Khi Phai Quen Di",
			"id"  : "LGJHTknaziacRdcyHtFnknTkWFzBchQbS" 
		},

		{
			"name": "Phia Sau Mot Co Gai",
			"id"  : "ZHcHtLGNpNNkWbJymyFHkHTLWbzSRBaRH" 
		},

		{
			"name": "Shape Of You",
			"id"  : "ZmxmyZHNpJnJZsbtHtbmkGtkWbzSuiaLV"
		},

		{
			"name": "Yeu",
			"id"  : "LGJHtLGsWbSakmBtHybmLHykpbSpnWdFG"
		},

		{
			"name": "Lac Troi",
			"id"  : "ZHcntZmNWcHCWCVyGybHLHtkWbSpGbSAc"
		},

		{
			"name": "Yeu 5",
			"id"  : "LmJnyLHsQcBFuZdtHyDmLmyLpFzQmgDdg"
		},

		{
			"name": "Noi Nay Co Anh",
			"id"  : "ZHcmyknNWcALJRCtntFmkmykQDSWmhbLF"
		},

		{
			"name": "We Dont Talk Anymore",
			"id"  : "ZnJmTLHNQlgWnHRyntbmkHyZQFApHWpNd"
		},

		{
			"name": "Thanh Xuan",
			"id"  : "ZHxmyZmaCFNWBhiTmtFnkGtkQbSWGCCCk"
		},

		{
			"name": "Nguoi Am Phu",
			"id"  : "kGcmyLmNxGElLERyGtFHLHTZWbzWncxmA"
		},

		{
			"name": "Quan Trong La Than Thai",
			"id"  : "kncGtLGscmamuJcymTbmkHTLQFlQmAgSs"
		},

		{
			"name": "Until You",
			"id"  : "ZHxnykmsdcvBxgstmTbHZHyLQbzQGWdVR"
		},

		{
			"name": "Yeu Thuong Ngay Do",
			"id"  : "LmJmTZnacHRbEZxynTvGLHTkpFAWndCbb"
		},
				{
			"name": "Xa ki niem",
			"id"  : "ZHxnykGNSCgsgLRymtbHkHTkQbWbJRWli"
		},
				{
			"name": "Lam sao giu",
			"id"  : "LmcmTkHsQlLnZEdyHTvmkmyLQFpDxuRsk"
		},
				{
			"name": "HayRaKhoiNguoiDoDi",
			"id"  : "ZGxHTLHaQaQknGxTnyvnkHtZWFQFcszAa"
		},
				{
			"name": "Buong doi tay nhau ra",
			"id"  : "ZmJntkmsQSQZpkLymtFHkHykQvpFJsCzx"
		},
		{
			"name": "Khong phai dang vua dau",
			"id"  : "LmJntkmsQbnLxhnymtFmLmyZQFWbJCJHH"
		},
		{
			"name": "Khuon mat dang thuong",
			"id"  : "knxmyLHaWFACnSNtHyFmknTZWbpbcuCCC"
		},
		{
			"name": "Ngam hoa le roi",
			"id"  : "ZmxmtkHNWRFsDiGtntbHkntZpbWdvchxd"
		},
		{
			"name": "Xin dung lang im",
			"id"  : "kGJmyknsCdDBadhynybmkHtkQbpdbiSud"
		},
		{
			"name": "Ngay mai em di",
			"id"  : "LncnyLnNCddlzHhyHTbmkmtkQFWdvHENR"
		},
		{
			"name": "Em gai mua",
			"id"  : "ZHJHtLmsCBChiLSyGyFmLHyLpbQdFRzRD"
		},
		{
			"name": "Needed me",
			"id"  : "LmxGtZnapSCWsnvTGyFnZmyLWDWVBGcuL"
		},
		{
			"name": "This is what you came for",
			"id"  : "kHxmyZnsQpHaACXymyvmLmyZQbpBDubxZ"
		},
		{
			"name": "Closer",
			"id"  : "kmxmyknapWQnSCxymybGLGtkQvQdFXhWZ"
		},
		{
			"name": "Cold water",
			"id"  : "kHJmTZGaQpzRJWWynybnkHyZQbWdbNcRd"
		},
		{
			"name": "What do you mean",
			"id"  : "knxGykmaQVRicubTGybHkmTkQvWdFvbnF"
		},
		{
			"name": "I do",
			"id"  : "ZHcnyknNzsZHBGgymTDnLHykpDpdbiuRD"
		},
		{
			"name": "Hanava",
			"id"  : "LHxntLHNCVBXZQGTmyFmLnykQFWBFZSap"
		},
		{
			"name": "Look what you made me do",
			"id"  : "LmxntZmNXBWEsJVtHtbGLmykWbpdFBdsL"
		},
		{
			"name": "..Ready for it?",
			"id"  : "ZmcnTZHsCBhcsWHtmyFGLmtkpFQBDSCbd"
		},
		{
			"name": "Lalala",
			"id"  : "LGJHyZmsQpzpizWyHyDGLnTkWbWdbbJBL"
		},
		{
			"name": "Daydreams",
			"id"  : "kmxmtkHsQFVSNxQymyFHkntZpFpBVnVQC"
		},
		{
			"name": "What is Love?",
			"id"  : "knxmyLHscHRzCWatmtbmkmykpbQBDuRSB"
		},
		{
			"name": "New Face",
			"id"  : "kmcHyknaCFznRngyGyDmLmtkpbpdFEzzl"
		},
		{
			"name": "I luv it",
			"id"  : "ZmJHykHNXblHimWynyFGZmtZQFQBBFdHG"
		},
		{
			"name": "Daddy",
			"id"  : "kHcmtLnspzSkNRiymTFHkGtkWFpBdLBCd"
		},
		{
			"name": "Cheap thrills",
			"id"  : "LmJHtLnsQzWVQJmyntbGLntZWFQBdFkNd"
		},
		{
			"name": "7 Years",
			"id"  : "kHcHtLmNQAZRLxQtmyFHkmtZpFWBFdgxs"
		},
		{
			"name": "Love yourseft",
			"id"  : "ZmxmyLGNWSvsiZFymyDnLHTkQbpBFEsdb"
		},
		{
			"name": "All falls down",
			"id"  : "LmcmyZmaCzbnJVXtHTbnLHyLQbpBdBdsJ"
		},
		{
			"name": "Wolves",
			"id"  : "LncHTknsgSLJCNNyHyDGLnyZWDpddBHzZ"
		},
		{
			"name": "I need your love",
			"id"  : "ZmJHyLHNSVcksQctmtbmZmyLWvQddZSSs"
		},
		{
			"name": "Hymn For The Weekend",
			"id"  : "ZHJmtLGNWASbbhmtmtbmkHyLQvQVBGxus"
		},
		{
			"name": "Adventure of a lifetime",
			"id"  : "kmxHykHspSFSccFtmtFmLntZWbpBdSnis"
		},
		{
			"name": "Theo Anh",
			"id"  : "LmJnTkmNgdCBRdatnyFHLnTLpDWaXklbg"
		},
		{
			"name": "Y em sao",
			"id"  : "LmcGyLnscGWhdhBtnyFnZmyZWbCZFEsBW"
		},
		{
			"name": "Kem duyen",
			"id"  : "LHxGyknaXSVpWRdtmTvHZmyLWFgkdmusF"
		},
		{
			"name": "Nguoi La Oi",
			"id"  : "kmxmtZmNxnZhpcJymtvmLGyLpbhkFJJGg"
		},
		{
			"name": "Lieu",
			"id"  : "kmcHykmNJGQvkRdynybHLmtkpFXkVJGJm"
		},
		{
			"name": "This what you came for",
			"id"  : "ZnxHykmNQQHNSXCTGtbHLmyZpFXkBQNgc"
		},
		{
			"name": "One Kiss",
			"id"  : "ZmcnyZmacHRFXJayHybHkHyZpbhkBJSWQ"
		}
	];
