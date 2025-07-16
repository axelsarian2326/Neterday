let map;
let mapPosts = JSON.parse(localStorage.getItem('mapPosts') || '[]');
let tempLatLng = null;
let markers = [];
let amis = JSON.parse(localStorage.getItem('amis') || '[]');
let mesPosts = JSON.parse(localStorage.getItem('mesPostsFull') || '[]');

function showToast(msg) {
    let toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 1800);
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
    if(id === "voyageModal") setTimeout(initGoogleMap, 100);
    if(id === "musiqueModal") { loadMusicOfDay(); loadPlaylist(); }
    if(id === "passionModal") { loadPassions(); loadPassionPosts(); }
    if(id === "objectifModal") { loadObjectif(); loadObjectifDone(); }
    if(id === "souvenirModal") { loadSouvenirs(); }
    if(id === "addSouvenirModal") {
        document.getElementById('souvenirCountry').value = '';
        document.getElementById('souvenirPhoto').value = '';
    }
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function initGoogleMap() {
    map = new google.maps.Map(document.getElementById("googleMap"), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapTypeId: 'roadmap'
    });

    map.addListener('click', function(event) {
        tempLatLng = event.latLng;
        document.getElementById('mapPostTitle').value = '';
        document.getElementById('mapPostPhoto').value = '';
        document.getElementById('mapPostDesc').value = '';
        openModal('mapPostModal');
    });

    renderMapPosts();
}

function saveMapPost() {
    let title = document.getElementById('mapPostTitle').value.trim();
    let desc = document.getElementById('mapPostDesc').value.trim();
    let file = document.getElementById('mapPostPhoto').files[0];
    if (!title || !desc || !tempLatLng) {
        showToast("Tous les champs sont obligatoires !");
        return;
    }
    let post = {
        title,
        desc,
        lat: tempLatLng.lat(),
        lng: tempLatLng.lng(),
        photo: ""
    };
    if (file) {
        let reader = new FileReader();
        reader.onload = function(ev) {
            post.photo = ev.target.result;
            mapPosts.push(post);
            localStorage.setItem('mapPosts', JSON.stringify(mapPosts));
            renderMapPosts();
            closeModal('mapPostModal');
            showToast("Post ajouté sur la carte !");
        };
        reader.readAsDataURL(file);
    } else {
        mapPosts.push(post);
        localStorage.setItem('mapPosts', JSON.stringify(mapPosts));
        renderMapPosts();
        closeModal('mapPostModal');
        showToast("Post ajouté sur la carte !");
    }
}

function renderMapPosts() {
    markers.forEach(m => m.setMap(null));
    markers = [];
    mapPosts.forEach((post, idx) => {
        let marker = new google.maps.Marker({
            position: { lat: post.lat, lng: post.lng },
            map: map,
            icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            }
        });
        marker.addListener('click', function() {
            document.getElementById('showMapPostTitle').textContent = post.title;
            if (post.photo) {
                document.getElementById('showMapPostPhoto').src = post.photo;
                document.getElementById('showMapPostPhoto').style.display = '';
            } else {
                document.getElementById('showMapPostPhoto').style.display = 'none';
            }
            document.getElementById('showMapPostDesc').textContent = post.desc;
            openModal('showMapPostModal');
        });
        markers.push(marker);
    });
}

function editNomPrenom() {
    let val = prompt("Entrez votre nom et prénom :", document.getElementById('nomPrenom').childNodes[0].nodeValue.trim());
    if(val) {
        document.getElementById('nomPrenom').childNodes[0].nodeValue = val + " ";
        localStorage.setItem('nomPrenom', val);
    }
}

function editPseudo() {
    let val = prompt("Entrez votre pseudo :", document.getElementById('pseudo').childNodes[0].nodeValue.trim());
    if(val) {
        document.getElementById('pseudo').childNodes[0].nodeValue = val + " ";
        localStorage.setItem('pseudo', val);
    }
}

function editSchool() {
    let val = prompt("Entrez votre école :", document.getElementById('school').textContent);
    if(val) {
        document.getElementById('school').textContent = val;
        localStorage.setItem('school', val);
    }
}

function editLove() {
    let val = prompt("Entrez votre situation amoureuse :", document.getElementById('love').textContent);
    if(val) {
        document.getElementById('love').textContent = val;
        localStorage.setItem('love', val);
    }
}

function loadAmis() {
    let div = document.getElementById('amisList');
    div.innerHTML = '';
    amis.forEach((pseudo, idx) => {
        let el = document.createElement('div');
        el.className = "amis-post";
        el.innerHTML = `<span style="cursor:pointer;color:#a259ff;" onclick="openChat('${pseudo}')"><i class="fa fa-user"></i> ${pseudo}</span>
            <button class="remove-ami" title="Supprimer" onclick="removeAmi(${idx})"><i class="fa fa-times"></i></button>`;
        div.appendChild(el);
    });
}

function addFriend() {
    let pseudo = document.getElementById('friendPseudo').value.trim();
    if(pseudo && !amis.includes(pseudo)) {
        amis.push(pseudo);
        localStorage.setItem('amis', JSON.stringify(amis));
        loadAmis();
        closeModal('addFriendModal');
    }
    document.getElementById('friendPseudo').value = '';
}

function removeAmi(idx) {
    if(confirm("Supprimer cet ami ?")) {
        amis.splice(idx, 1);
        localStorage.setItem('amis', JSON.stringify(amis));
        loadAmis();
    }
}

function loadMesPosts() {
    let ul = document.getElementById('mesPosts');
    ul.innerHTML = '';
    mesPosts.forEach((post, idx) => {
        let li = document.createElement('li');
        li.innerHTML = `<b>${post.title}</b> <br>
            <img src="${post.photo || ''}" style="max-width:60px;max-height:60px;border-radius:8px;vertical-align:middle;${post.photo?'':'display:none;'}"><br>
            <small>${post.date || ''}</small><br>
            <span>${post.desc || ''}</span>
            <button class="remove-post" title="Supprimer" onclick="removePost(${idx})"><i class="fa fa-trash"></i></button>`;
        ul.appendChild(li);
    });
}

function removePost(idx) {
    if(confirm("Supprimer ce post ?")) {
        mesPosts.splice(idx, 1);
        localStorage.setItem('mesPostsFull', JSON.stringify(mesPosts));
        loadMesPosts();
    }
}

window.onload = function() {
    let pic = localStorage.getItem('profilePic');
    if(pic) {
        document.getElementById('profilePicImg').src = pic;
        document.getElementById('profilePicImg').style.display = '';
        document.getElementById('profilePicText').style.display = 'none';
    }
    let nomPrenom = localStorage.getItem('nomPrenom');
    if(nomPrenom) document.getElementById('nomPrenom').childNodes[0].nodeValue = nomPrenom + " ";
    let pseudo = localStorage.getItem('pseudo');
    if(pseudo) document.getElementById('pseudo').childNodes[0].nodeValue = pseudo + " ";
    let school = localStorage.getItem('school');
    if(school) document.getElementById('school').textContent = school;
    let love = localStorage.getItem('love');
    if(love) document.getElementById('love').textContent = love;
    loadMesPosts();
    loadAmis();
    loadSouvenirs();
};