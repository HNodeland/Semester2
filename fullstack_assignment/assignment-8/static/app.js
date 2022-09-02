let app =  Vue.createApp({
    data: function()
    {
        return {
            //ENTRIES
            entries: [],
            new_id: "",
            new_name: "",
            new_email: "",
            new_number: "",
            
            //USERS
            user_name: "",
            user_password: "",
            
            //Currently logged inn user
            user_id: "",
            log_in: false,

            //Site logic
            add_entry_shown: true,
            edit_shown: true,
            search_shown: true,
            index: 0,
            log_in_error:"",
            errorMessage:"",
            searchInput:"",
            searchList: [],
        }
    },
    //Fills the entries list with data
    created: async function(){
        var data = await fetch("/entries",{
            method: "POST",
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify({user_id: this.user_id})
        }
        );
        if (data.status == 200){
            var result = await data.json();
            this.entries = result;
        }
        else{
            console.log("Entry load Unsuccessful")
        }
    },
    methods: {
        add_entry: async function(){
            var valid = validateInput(this.new_name, this.new_number, this.new_email, true)
            if (valid){
                this.new_id = Math.floor(Math.random() * 100000);
                var new_entry = {id: this.new_id, name: this.new_name, email: this.new_email, number: this.new_number, user_id: this.user_id};
                
                if (this.new_name && this.new_email && this.new_number){
                    this.entries.push(new_entry);
                }
                var data = await fetch("/add_entry",{
                    method: "POST",
                    headers: {"Content-Type": "application/json",},
                    body: JSON.stringify(new_entry)
                });
                if (data.status == 200){
                    var result = await data.json();
                    if (result.status == 200){
                            this.entries = result
                    }
                } 
                else{
                    console.log("New entry Unsuccessful")
                }
            }
            else{
                console.log("error")
            }
        },
        edit_entry: async function(index){
            var valid = validateInput(this.new_name, this.new_number, this.new_email, false)
            if (valid){
                var old_id = (this.entries[index].id)
                var updated_entry = {id: old_id , name: this.new_name, email: this.new_email, number: this.new_number, user_id: this.user_id};
                
                if (this.new_name && this.new_email && this.new_number){
                    this.entries[index] = updated_entry
                }
                var data = await fetch("/edit_entry",{
                    method: "POST",
                    headers: {"Content-Type": "application/json",},
                    body: JSON.stringify(updated_entry)
                });
                if (data.status == 200){
                    var result = await data.json();
                    if (result.status == 200){
                        this.entries = data.json();
                        console.log("Editing successful")
                    }
                } 
                else{
                    console.log("Editing Unsuccessful")
                }
                if (this.edit_shown){
                    this.edit_shown = !this.edit_shown
                }
                else{
                    this.edit_shown = true
                }
            }
        },
        delete_entry: async function(index){
            var delete_entry = (this.entries[index])
            this.entries.splice(index, 1)
            
            var data = await fetch("/delete_entry",{
                method: "POST",
                headers: {"Content-Type": "application/json",},
                body: JSON.stringify(delete_entry, {user_id: this.user_id})
            });
            if (data.status == 200){
                var result = await data.json();
                if (result.status == 200){
                    this.entries = data.json();
                    console.log("Deletion successful")
                    console.log(this.entries)
                }
            }
            else{
                console.log("Deletion Unsuccessful")
            }
        },
        log_in_user: async function(){
            //Sends data from the log in form to app.py
            var data = await fetch("/log_in", {
                method: "POST",
                headers: {"Content-Type": "application/json",},
                body: JSON.stringify({username: this.user_name, password: this.user_password})
            });
            //If there is data, log in was succesfull with matching username and password
            if (data.status == 200){
                var result = await data.json();
                if (result.length == 0){
                    console.log("Wrong username or password")
                    this.user_id = ""
                    this.log_in = false
                    this.log_in_error = "Wrong username or password"
                }
                else{
                    verified_user = result[0].username
                    //We now have a logged in user
                    this.user_id = this.user_name
                    this.log_in = true
                    //Fetches entries for that user
                    var data = await fetch("/entries",{
                        method: "POST",
                        headers: {"Content-Type": "application/json",},
                        body: JSON.stringify({user_id: this.user_id})
                    });
                    if (data.status == 200){
                        var result = await data.json();
                        this.entries = result;
                        this.log_in_error = ""
                    }
                    else{
                        console.log("Unable to load data")
                    }
                }
            }
            else{
                console.log("Unable to retrieve data")
                this.log_in_error = "Missing username or password"
            }
        },
        log_out_user: async function(){
            this.user_id = ""
            this.log_in = false
        },
        search_entries: async function(){
            if (this.search_shown){
                this.search_shown = !this.search_shown
            }
            else{
                this.search_shown = true
            }
            this.searchList.splice(0, this.searchList.length)
            var input = this.searchInput
            input = input.toUpperCase();
            for (i = 0; i < this.entries.length; i++){
                var search_name = this.entries[i].name.toUpperCase();
                var search_number = this.entries[i].number.toUpperCase();
                var search_email = this.entries[i].email.toUpperCase();

                if (search_name.includes(input) || search_number.includes(input) || search_email.includes(input)){
                    this.searchList.push(this.entries[i]);
                }
                console.log(this.searchList[i])
            }           
        },
        show_add_entry(){
            if (this.add_entry_shown){
                this.add_entry_shown = !this.add_entry_shown
            }
            else{
                this.add_entry_shown = true
            }
        },
        show_edit_entry(index){
            if (this.edit_shown){
                this.edit_shown = !this.edit_shown
            }
            else{
                this.edit_shown = true
            }
            this.index = index
        },
    }
});
app.mount("#app")

//Validation function from assigment 4
function validateInput(nameInput, numberInput, emailInput, add){ 
    var valid = true, name = true,  phone = true, validPhone = true, email = true, validEmail = false, numberFormat = ["1","2","3","4","5","6","7","8","9","0", "+", "-", "(", ")", " "], mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; //mailformat,  https://www.w3resource.com/javascript/form/email-validation.php
    
    //Checks if name is empty
    if (nameInput === '' || nameInput == null){
        name = false;
    }           
    //Checks if phone number is empty
    if(numberInput === '' || numberInput == null){
        phone = false;
    }
    //Checks if phone number is valid
    numberList = numberInput.split("");
    for (i = 0; i < numberList.length; i++){
        for (k = 0; k < numberFormat.length;k++){
            if (numberList[i] === numberFormat[k]){
                var check = true;
            }
        }
        //'Check' is only true when it is matches one of 'numberFormats' entries.
        if (!check){
            validPhone = false;
        }
        check = false;
    }
    //Checks if email is empty          
    if (emailInput === "" || emailInput == null){
        email = false;
        validEmail = true;
    }
    //Chekcs if email is valid
    if (emailInput.match(mailFormat)){
        validEmail = true;
    }

    var errorMessage = ""
    if (!name){
        valid = false;
        errorMessage += "<br>Du har ikke et navn!";
    }
    if (!phone){
        errorMessage += "<br>Du har ikke et nummer!";
    }   
    if (!validPhone){
        errorMessage += "<br>Du har ikke et GYLDIG nummer!";
        valid = false;
    }   
    if (!email){
        errorMessage += "<br>Du har ikke en email!";
    }
    if (!validEmail){
        errorMessage += "<br>Du har ikke en GYLDIG email!";
        valid = false;
    }
    if (!phone && !email){
        valid = false;
        errorMessage += "<br>Du har hverken nummer ELLER epost";
    }
    if (valid)
        errorMessage = "";
    
    if (add){
        document.getElementById("addErrorMessage").innerHTML = errorMessage
    }
    else[
        
        document.getElementById("modifyErrorMessage").innerHTML = errorMessage
    ]
    return valid;
}