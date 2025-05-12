// ======= Toggle Search Bar =======
function toggleSearch() {
    const input = document.getElementById("searchInput");
    input.style.display = input.style.display === "none" ? "inline-block" : "none";
}

// ======= Search Functionality =======
function search() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const categories = JSON.parse(localStorage.getItem("categories") || "[]");
    const searchResults = document.getElementById("searchResults");

    if (!searchResults) return;

    searchResults.innerHTML = ""; // Clear previous results

    // Search in posts
    const filteredPosts = posts.filter(post => 
        post.content.toLowerCase().includes(query) || 
        (post.category && post.category.toLowerCase().includes(query))
    );

    if (filteredPosts.length > 0) {
        const postResults = document.createElement("div");
        postResults.innerHTML = `<h3>Posts:</h3>`;
        filteredPosts.forEach(post => {
            const postDiv = document.createElement("div");
            postDiv.className = "post";
            postDiv.innerHTML = `
                <p><strong>Category: ${post.category || "General"}</strong></p>
                <p>${post.content}</p>
                ${post.media ? (post.type.startsWith("video") 
                    ? `<video width="300" controls><source src="${post.media}" type="${post.type}"></video>` 
                    : `<img src="${post.media}" width="300">`) 
                    : ""}
            `;
            postResults.appendChild(postDiv);
        });
        searchResults.appendChild(postResults);
    }

    // Search in categories
    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(query) || 
        cat.description.toLowerCase().includes(query)
    );

    if (filteredCategories.length > 0) {
        const categoryResults = document.createElement("div");
        categoryResults.innerHTML = `<h3>Categories:</h3>`;
        filteredCategories.forEach(cat => {
            const categoryDiv = document.createElement("div");
            categoryDiv.className = "category-card";
            categoryDiv.innerHTML = `
                <h4>${cat.name}</h4>
                <p>${cat.description}</p>
                ${cat.image ? `<img src="${cat.image}" width="100">` : ""}
            `;
            searchResults.appendChild(categoryDiv);
        });
    }

    // If no results found
    if (filteredPosts.length === 0 && filteredCategories.length === 0) {
        searchResults.innerHTML = `<p>No results found for "${query}"</p>`;
    }
}

// ======= Search Posts =======
function searchPosts() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const posts = document.querySelectorAll(".post");

    posts.forEach(post => {
        const text = post.innerText.toLowerCase();
        post.style.display = text.includes(search) ? "block" : "none";
    });
}

// ======= Search Users =======
function filterUsers() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let listItems = document.querySelectorAll('#userList li');
    listItems.forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(input) ? 'block' : 'none';
    });
}

// ======= Toggle Sidebar =======
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const body = document.body;
    const menuToggle = document.getElementById("menuToggle");
    const icon = menuToggle.querySelector("i");

    sidebar.classList.toggle("active");
    body.classList.toggle("sidebar-open");

    if (sidebar.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
    } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
    }
}

// ======= Submit Profile Changes =======
const profileForm = document.getElementById("editProfileForm");
if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const bio = document.getElementById("bio").value;
        const profilePic = document.getElementById("profilePic").files[0];

        document.getElementById("displayUsername").textContent = username;
        document.getElementById("displayBio").textContent = bio;

        if (profilePic) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("previewImg").src = e.target.result;
            };
            reader.readAsDataURL(profilePic);
        } else {
            document.getElementById("previewImg").src = "";
        }

        document.getElementById("updatedProfile").style.display = "block";
    });
}

// ======= Post Form Submit =======
const postForm = document.getElementById("postForm");
if (postForm) {
    postForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const content = document.getElementById("postContent").value;
        const mediaInput = document.getElementById("mediaInput");
        const file = mediaInput.files[0];

        const post = {
            content,
            media: null,
            type: null
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                post.media = event.target.result;
                post.type = file.type;
                savePost(post);
            };
            reader.readAsDataURL(file);
        } else {
            savePost(post);
        }

        document.getElementById("postForm").reset();
    });
}

// ======= Save Post to Local Storage =======
function savePost(post) {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
        alert("Please log in to post.");
        return;
    }

    post.username = user.username;
    post.profilePic = user.profilePic;

    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    posts.unshift(post);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts(); // لإعادة عرض المنشورات بعد الحفظ
}

// ======= Render Posts with Like and Comment =======
function renderPosts() {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const postList = document.getElementById("postList");
    if (!postList) return;
    postList.innerHTML = "";

    posts.forEach((post, index) => {
        const postDiv = document.createElement("div");
        postDiv.className = "post";
        postDiv.innerHTML = `
            <div class="post-header">
                <img src="${post.profilePic || 'default-profile.png'}" alt="User Picture" style="width: 30px; height: 30px; border-radius: 50%;">
                <span>${post.username || "Anonymous"}</span>
            </div>
            <p><strong>Category: ${post.category || "General"}</strong></p>
            <p>${post.content}</p>
            ${post.media ? (post.type.startsWith("video") 
                ? `<video width="300" controls><source src="${post.media}" type="${post.type}"></video>` 
                : `<img src="${post.media}" width="300">`) 
                : ""}
            <div class="post-actions" style="display: flex; gap: 10px; align-items: center;">
                <button onclick="likePost(${index})">Like (<span id="likeCount-${index}">${post.likes || 0}</span>)</button>
                <button onclick="toggleCommentSection(${index})">Comment</button>
            </div>
            <div id="commentSection-${index}" class="comment-section" style="display: none;">
                <textarea id="commentInput-${index}" placeholder="Write a comment..."></textarea>
                <button onclick="addComment(${index})">Add Comment</button>
                <div id="comments-${index}">
                    ${(post.comments || []).map(comment => `<p>${comment}</p>`).join("")}
                </div>
            </div>
        `;
        postList.appendChild(postDiv);
    });
}

// ======= Like Post =======
function likePost(index) {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    posts[index].likes = (posts[index].likes || 0) + 1;
    localStorage.setItem("posts", JSON.stringify(posts));
    document.getElementById(`likeCount-${index}`).textContent = posts[index].likes;
}

// ======= Toggle Comment Section =======
function toggleCommentSection(index) {
    const commentSection = document.getElementById(`commentSection-${index}`);
    commentSection.style.display = commentSection.style.display === "none" ? "block" : "none";
}

// ======= Add Comment =======
function addComment(index) {
    const commentInput = document.getElementById(`commentInput-${index}`);
    const commentText = commentInput.value.trim();
    if (!commentText) return;

    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    posts[index].comments = posts[index].comments || [];
    posts[index].comments.push(commentText);
    localStorage.setItem("posts", JSON.stringify(posts));

    const commentsDiv = document.getElementById(`comments-${index}`);
    commentsDiv.innerHTML += `<p>${commentText}</p>`;
    commentInput.value = "";
}

// ======= Load Posts on Page Load =======
document.addEventListener("DOMContentLoaded", function () {
    renderPosts();
    renderCategories(); // كمان نعرض الكاتيجوري عند تحميل الصفحة
});

// ======= Handle Category Form Submit =======
const categoryForm = document.getElementById("categoryForm");
if (categoryForm) {
    categoryForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("categoryName").value;
        const description = document.getElementById("categoryDescription").value;
        const imageInput = document.getElementById("categoryImage");
        const file = imageInput.files[0];

        const category = {
            name,
            description,
            image: null
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                category.image = event.target.result;
                saveCategory(category);
            };
            reader.readAsDataURL(file);
        } else {
            saveCategory(category);
        }

        document.getElementById("categoryForm").reset();
    });
}

// ======= Save Category =======
function saveCategory(category) {
    const categories = JSON.parse(localStorage.getItem("categories") || "[]");
    categories.push(category);
    localStorage.setItem("categories", JSON.stringify(categories));
    alert("تمت إضافة الكاتيجوري بنجاح");
    renderCategories(); // إعادة عرض الفئات
}

// ======= Render Categories =======
function renderCategories() {
    const categories = JSON.parse(localStorage.getItem("categories") || "[]");
    const list = document.getElementById("categoryList");
    if (!list) return;
    list.innerHTML = "";

    categories.forEach(cat => {
        const div = document.createElement("div");
        div.className = "category-card";
        div.innerHTML = `
            <h4 onclick="filterPostsByCategory('${cat.name}')">${cat.name}</h4>
            <p>${cat.description}</p>
        `;

        if (cat.image) {
            div.innerHTML += `<img src="${cat.image}" width="100">`;
        }

        list.appendChild(div);
    });
}

// ======= Filter Posts by Category =======
function filterPostsByCategory(category) {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const postList = document.getElementById("postList");
    if (!postList) return;

    postList.innerHTML = ""; // Clear the post list

    // Filter posts by the selected category
    const filteredPosts = posts.filter(post => post.category === category);

    if (filteredPosts.length === 0) {
        postList.innerHTML = `<p>No posts found for category: ${category}</p>`;
        return;
    }

    // Render filtered posts
    filteredPosts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.className = "post";
        postDiv.innerHTML = `
            <p><strong>Category: ${post.category}</strong></p>
            <p>${post.content}</p>
            ${post.media ? (post.type.startsWith("video") 
                ? `<video width="300" controls><source src="${post.media}" type="${post.type}"></video>` 
                : `<img src="${post.media}" width="300">`) 
                : ""}
        `;
        postList.appendChild(postDiv);
    });
}

// ======= Populate Categories in Post Form =======
function populateCategories() {
    const categories = JSON.parse(localStorage.getItem("categories") || "[]");
    const categorySelect = document.getElementById("categorySelect");
    if (!categorySelect) return;

    categorySelect.innerHTML = ""; // Clear existing options

    // Add default categories
    const defaultCategories = ["General", "Sports", "Tech", "Entertainment", "Cooking", "Love"];
    defaultCategories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });

    // Add user-created categories
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.name;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
}

// Call populateCategories when the page loads
document.addEventListener("DOMContentLoaded", function () {
    populateCategories();
});

// ======= Register User =======
document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const profilePicInput = document.getElementById("profilePic");
    const file = profilePicInput.files[0];

    const user = {
        username,
        email,
        password,
        profilePic: null
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            user.profilePic = event.target.result;
            saveUser(user);
        };
        reader.readAsDataURL(file);
    } else {
        saveUser(user);
    }
});

function saveUser(user) {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registration successful! Please log in.");
    window.location.href = "login.html"; // Redirect to login page
}

// ======= Login User =======
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.length === 0) {
        alert("No users found. Please register first.");
        return;
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        alert("Login successful!");
        window.location.href = "home.html"; // Redirect to home page
    } else {
        alert("Invalid username or password.");
    }
});

// ======= Load User Info =======
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
        document.getElementById("userName").textContent = user.username;
        document.getElementById("userProfilePic").src = user.profilePic || "default-profile.png";
    } else {
        alert("No user logged in. Please log in first.");
        window.location.href = "login.html"; // Redirect to login page
    }
}

// ======= Load User Info on Home Page =======
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("userInfo")) {
        loadUserInfo();
    }
});
