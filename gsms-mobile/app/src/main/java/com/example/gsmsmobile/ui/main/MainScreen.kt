package com.example.gsmsmobile.ui.main

import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavKey
import com.example.gsmsmobile.data.*
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay

// --- Tabs Enum ---
enum class AppTab(val title: String, val icon: ImageVector) {
    HOME("Home", Icons.Default.Home),
    PREDICT("AI Predict", Icons.Default.Search),
    BEDS("Beds Board", Icons.Default.List),
    APPOINTMENTS("Bookings", Icons.Default.DateRange),
    REPORTS("Reports", Icons.Default.Notifications)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    onItemClick: (NavKey) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MainScreenViewModel = viewModel { MainScreenViewModel(DefaultDataRepository()) }
) {
    val repository = viewModel.repository
    var currentTab by remember { mutableStateOf(AppTab.HOME) }
    val coroutineScope = rememberCoroutineScope()
    
    // Auth Modals State
    var showAuthDialog by remember { mutableStateOf(false) }
    var isRegisterMode by remember { mutableStateOf(false) }
    var authError by remember { mutableStateOf("") }
    
    // Form States
    var emailOrPhone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var regName by remember { mutableStateOf("") }
    var regEmail by remember { mutableStateOf("") }
    var regPhone by remember { mutableStateOf("") }
    var regPassword by remember { mutableStateOf("") }
    var regAge by remember { mutableStateOf("") }
    var regGender by remember { mutableStateOf("Male") }
    var regAddress by remember { mutableStateOf("") }
    
    // Notification Banner State
    var showNotificationBanner by remember { mutableStateOf(true) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = "Logo",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("GSMS Smart Portal", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                    }
                },
                actions = {
                    val user = repository.currentUser
                    if (user != null) {
                        Text("Hi, ${user.fullName.substringBefore(" ")}", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        IconButton(onClick = { repository.logout(); currentTab = AppTab.HOME }) {
                            Icon(Icons.Default.ExitToApp, contentDescription = "Logout", tint = Color.Red)
                        }
                    } else {
                        Button(
                            onClick = { showAuthDialog = true; isRegisterMode = false },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Text("Sign In", fontWeight = FontWeight.Bold)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                )
            )
        },
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                AppTab.values().forEach { tab ->
                    NavigationBarItem(
                        selected = currentTab == tab,
                        onClick = { currentTab = tab },
                        label = { Text(tab.title, fontSize = 11.sp, fontWeight = FontWeight.Medium) },
                        icon = { Icon(tab.icon, contentDescription = tab.title, modifier = Modifier.size(24.dp)) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.primary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            indicatorColor = MaterialTheme.colorScheme.primaryContainer
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFFF8FAFC)) // Clean professional light slate background
        ) {
            // Notifications Banner
            if (showNotificationBanner && repository.currentUser != null && repository.notifications.isNotEmpty()) {
                val latestNotif = repository.notifications.first()
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f))
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Notifications, contentDescription = "Alert", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = latestNotif.message,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(onClick = { showNotificationBanner = false }, modifier = Modifier.size(24.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Dismiss", modifier = Modifier.size(16.dp))
                    }
                }
            }

            Box(modifier = Modifier.weight(1f)) {
                when (currentTab) {
                    AppTab.HOME -> TabHome(repository) { showAuthDialog = true; isRegisterMode = false }
                    AppTab.PREDICT -> TabPredict(repository) { showAuthDialog = true; isRegisterMode = false }
                    AppTab.BEDS -> TabBeds(repository)
                    AppTab.APPOINTMENTS -> TabAppointments(repository) { showAuthDialog = true; isRegisterMode = false }
                    AppTab.REPORTS -> TabReports(repository) { showAuthDialog = true; isRegisterMode = false }
                }
            }
        }
    }

    // --- Authentication Dialog ---
    if (showAuthDialog) {
        Dialog(onDismissRequest = { showAuthDialog = false }) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Column(
                    modifier = Modifier
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState()),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = if (isRegisterMode) "Create Medical Account" else "Sign In to GSMS",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp,
                        color = Color(0xFF0F172A)
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    if (authError.isNotEmpty()) {
                        Text(
                            text = authError,
                            color = Color.Red,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                    }

                    if (isRegisterMode) {
                        OutlinedTextField(
                            value = regName,
                            onValueChange = { regName = it },
                            label = { Text("Full Name") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = regEmail,
                            onValueChange = { regEmail = it },
                            label = { Text("Email Address") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = regPhone,
                            onValueChange = { regPhone = it },
                            label = { Text("Mobile Number") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = regPassword,
                            onValueChange = { regPassword = it },
                            label = { Text("Create Password") },
                            visualTransformation = PasswordVisualTransformation(),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(modifier = Modifier.fillMaxWidth()) {
                            OutlinedTextField(
                                value = regAge,
                                onValueChange = { regAge = it },
                                label = { Text("Age") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            OutlinedTextField(
                                value = regGender,
                                onValueChange = { regGender = it },
                                label = { Text("Gender (M/F)") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = regAddress,
                            onValueChange = { regAddress = it },
                            label = { Text("Home Address") },
                            modifier = Modifier.fillMaxWidth(),
                            maxLines = 2
                        )
                    } else {
                        OutlinedTextField(
                            value = emailOrPhone,
                            onValueChange = { emailOrPhone = it },
                            label = { Text("Email or Mobile Number") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = password,
                            onValueChange = { password = it },
                            label = { Text("Password") },
                            visualTransformation = PasswordVisualTransformation(),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            coroutineScope.launch {
                                authError = ""
                                if (isRegisterMode) {
                                    if (regName.isEmpty() || regEmail.isEmpty() || regPhone.isEmpty() || regPassword.isEmpty()) {
                                        authError = "All core fields are required."
                                        return@launch
                                    }
                                    val success = repository.register(
                                        regName, regEmail, regPhone, regPassword,
                                        regAge.toIntOrNull() ?: 30, regGender, regAddress
                                    )
                                    if (success) showAuthDialog = false
                                    else authError = "Registration failed."
                                } else {
                                    if (emailOrPhone.isEmpty() || password.isEmpty()) {
                                        authError = "Please fill in all fields."
                                        return@launch
                                    }
                                    val success = repository.login(emailOrPhone, password)
                                    if (success) showAuthDialog = false
                                    else authError = "Invalid credentials. (john@gmail.com / password123)"
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Text(if (isRegisterMode) "Register & Verify OTP" else "Verify & Sign In", fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    TextButton(onClick = { isRegisterMode = !isRegisterMode; authError = "" }) {
                        Text(if (isRegisterMode) "Already have an account? Sign In" else "New patient? Create Account")
                    }
                }
            }
        }
    }
}

// ==========================================
// --- Tab 1: Home / Dashboard Screen ---
// ==========================================
@Composable
fun TabHome(repository: DataRepository, onSignInClick: () -> Unit) {
    var showSosConfirmation by remember { mutableStateOf(false) }
    var sosActive by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero Clinical Banner
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0F766E)) // Teal primary
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Hospital-Grade", color = Color(0xFF2DD4BF), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Smart Medical Assistance", color = Color.White, fontWeight = FontWeight.Black, fontSize = 24.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Check symptoms using AI algorithms, view live ICU bed tracking, and book fast clinical consultations.", color = Color.White.copy(alpha = 0.85f), fontSize = 13.sp)
                }
            }
        }

        // Emergency SOS Quick Action
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2)),
                border = BorderStroke(1.dp, Color(0xFFFCA5A5))
            ) {
                Row(
                    modifier = Modifier
                        .padding(16.dp)
                        .fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFEF4444)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Warning, contentDescription = "SOS", tint = Color.White)
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Critical Emergency Dispatch", fontWeight = FontWeight.Bold, color = Color(0xFF991B1B), fontSize = 14.sp)
                        Text("Need immediate clinical ambulance dispatch?", fontSize = 11.sp, color = Color(0xFF7F1D1D))
                    }
                    Button(
                        onClick = {
                            if (sosActive) {
                                sosActive = false
                            } else {
                                showSosConfirmation = true
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = if (sosActive) Color.Gray else Color(0xFFEF4444))
                    ) {
                        Text(if (sosActive) "Cancel SOS" else "Trigger SOS", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }

        // SOS Active banner details
        if (sosActive) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB)),
                    border = BorderStroke(1.dp, Color(0xFFFDE68A))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp, color = Color(0xFFD97706))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Ambulance dispatched to your coordinates", fontWeight = FontWeight.Bold, color = Color(0xFF92400E), fontSize = 13.sp)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Sharing your live coordinates (12.9830, 80.2501) with Apollo Health Center.", fontSize = 11.sp, color = Color(0xFFB45309))
                    }
                }
            }
        }

        // Patient Profile / Quick Statistics (Only if signed in)
        val user = repository.currentUser
        if (user != null) {
            item {
                Text("Patient Profile Summary", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF1E293B))
            }
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(user.fullName, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF0F172A))
                                Text("Age: ${user.age} | Gender: ${user.gender}", fontSize = 12.sp, color = Color(0xFF64748B))
                            }
                            // Health Score Badge
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFFECFDF5))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text("Health Score: 92/100", color = Color(0xFF047857), fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            }
                        }
                        Divider(modifier = Modifier.padding(vertical = 12.dp), color = Color(0xFFF1F5F9))
                        Text("Insurance: Apollo Health Shield - Policy #98234", fontSize = 12.sp, color = Color(0xFF475569))
                        Text("Address: ${user.address}", fontSize = 12.sp, color = Color(0xFF475569))
                    }
                }
            }
            
            // Upcoming Appointments
            if (repository.appointments.isNotEmpty()) {
                item {
                    Text("Upcoming Scheduled Consultations", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF1E293B))
                }
                items(repository.appointments) { appt ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.DateRange, contentDescription = "Booking", tint = Color(0xFF0D9488), modifier = Modifier.size(24.dp))
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(appt.doctorName, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text("${appt.hospitalName} | ${appt.dateTime}", fontSize = 12.sp, color = Color(0xFF64748B))
                                Text("Notes: ${appt.notes}", fontSize = 11.sp, color = Color(0xFF64748B))
                            }
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFFEEF2F6))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(appt.status.uppercase(), color = Color(0xFF0F172A), fontWeight = FontWeight.Bold, fontSize = 9.sp)
                            }
                        }
                    }
                }
            }
        } else {
            // Promo Sign In Banner
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Personalized Health Board", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF0F172A))
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Log in to track your medical records, consult history, and generate diagnostic predictions.", color = Color(0xFF64748B), fontSize = 12.sp, modifier = Modifier.padding(horizontal = 8.dp))
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = onSignInClick) {
                            Text("Sign In Now")
                        }
                    }
                }
            }
        }

        // Nearby Hospital Directory Section
        item {
            Text("Regional Hospital Directories", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF1E293B))
        }

        items(repository.getHospitals()) { hospital ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(hospital.name, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF0F172A))
                            Text(hospital.address, fontSize = 12.sp, color = Color(0xFF64748B))
                        }
                        Text(hospital.distance, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color(0xFF0D9488))
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Specialties: ${hospital.specialties}", fontSize = 11.sp, color = Color(0xFF475569))
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Bed count alert status
                        val bedColor = if (hospital.availableBeds > 20) Color(0xFF057857) else if (hospital.availableBeds > 0) Color(0xFFD97706) else Color(0xFFB91C1C)
                        val bedText = if (hospital.availableBeds > 0) "${hospital.availableBeds} beds available" else "Full (0 beds)"
                        Text(bedText, color = bedColor, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        
                        Text(hospital.phone, fontSize = 11.sp, color = Color(0xFF64748B))
                    }
                }
            }
        }
    }

    // SOS Dispatch Dialog
    if (showSosConfirmation) {
        AlertDialog(
            onDismissRequest = { showSosConfirmation = false },
            title = { Text("Confirm SOS Emergency Call") },
            text = { Text("Are you sure you want to trigger emergency Clinical Dispatch? This will share your location and request an immediate ambulance.") },
            confirmButton = {
                Button(
                    onClick = {
                        sosActive = true
                        showSosConfirmation = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444))
                ) {
                    Text("Confirm SOS", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showSosConfirmation = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

// ==========================================
// --- Tab 2: AI Predict / Diagnosis ---
// ==========================================
@Composable
fun TabPredict(repository: DataRepository, onSignInClick: () -> Unit) {
    val symptoms = listOf(
        "Fever", "Cough", "Sore Throat", "Sneezing", "Runny Nose",
        "Chills", "Body Ache", "Fatigue", "Headache", "Nausea",
        "Sensitivity to light", "Aura", "Stomach Pain", "Vomiting",
        "Abdominal Bloating", "Shortness of Breath", "Chest Pain",
        "Dry Cough", "Loss of Taste"
    )

    var selectedSymptoms by remember { mutableStateOf(setOf<String>()) }
    var severity by remember { mutableStateOf(5f) }
    var runningPrediction by remember { mutableStateOf(false) }
    var result by remember { mutableStateOf<PredictionResult?>(null) }
    var searchSymptomQuery by remember { mutableStateOf("") }
    
    // Voice status
    var isListening by remember { mutableStateOf(false) }

    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("AI Diagnostic Symptom Analysis", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF1E293B))

        if (repository.currentUser == null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB)),
                border = BorderStroke(1.dp, Color(0xFFFDE68A))
            ) {
                Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Authentication Required", fontWeight = FontWeight.Bold, color = Color(0xFF92400E), fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("You must be logged in to access AI Diagnostic predictions.", fontSize = 12.sp, color = Color(0xFFB45309))
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(onClick = onSignInClick) {
                        Text("Log In")
                    }
                }
            }
        } else {
            // Symptom Selection Form
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Select Symptoms", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Voice input simulator button
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = searchSymptomQuery,
                            onValueChange = { searchSymptomQuery = it },
                            placeholder = { Text("Search symptoms...", fontSize = 12.sp) },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        IconButton(
                            onClick = {
                                isListening = true
                                coroutineScope.launch {
                                    delay(2500) // Simulation recording delay
                                    selectedSymptoms = selectedSymptoms + setOf("Cough", "Fever")
                                    isListening = false
                                    searchSymptomQuery = ""
                                }
                            },
                            colors = IconButtonDefaults.iconButtonColors(
                                containerColor = if (isListening) Color(0xFFFCA5A5) else MaterialTheme.colorScheme.primaryContainer
                            )
                        ) {
                            Icon(
                                imageVector = if (isListening) Icons.Default.Warning else Icons.Default.PlayArrow, 
                                contentDescription = "Voice Input",
                                tint = if (isListening) Color.Red else MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                    if (isListening) {
                        Text("Recording voice... Speak symptoms clearly", color = Color.Red, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp))
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    
                    // Symptom Chips
                    val filtered = symptoms.filter { it.contains(searchSymptomQuery, ignoreCase = true) }
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        mainAxisSpacing = 6.dp,
                        crossAxisSpacing = 6.dp
                    ) {
                        filtered.forEach { s ->
                            val isSelected = selectedSymptoms.contains(s)
                            FilterChip(
                                selected = isSelected,
                                onClick = {
                                    selectedSymptoms = if (isSelected) selectedSymptoms - s else selectedSymptoms + s
                                },
                                label = { Text(s, fontSize = 11.sp) }
                            )
                        }
                    }
                    
                    if (selectedSymptoms.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Selected (${selectedSymptoms.size}):", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(modifier = Modifier.horizontalScroll(rememberScrollState())) {
                            selectedSymptoms.forEach { s ->
                                Box(
                                    modifier = Modifier
                                        .padding(end = 6.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(Color(0xFFE0F2FE))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(s, color = Color(0xFF0369A1), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Icon(
                                            Icons.Default.Close, 
                                            contentDescription = "Remove",
                                            tint = Color(0xFF0369A1),
                                            modifier = Modifier.size(12.dp).clickable { selectedSymptoms = selectedSymptoms - s }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Severity Slider
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Symptom Severity Scale", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        val ratingText = if (severity > 7f) "Severe" else if (severity > 3f) "Moderate" else "Mild"
                        val ratingColor = if (severity > 7f) Color.Red else if (severity > 3f) Color(0xFFD97706) else Color(0xFF057857)
                        Text(ratingText, color = ratingColor, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Slider(
                        value = severity,
                        onValueChange = { severity = it },
                        valueRange = 1f..10f,
                        steps = 8
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("1 (Very Mild)", fontSize = 10.sp, color = Color.Gray)
                        Text("10 (Critical)", fontSize = 10.sp, color = Color.Gray)
                    }
                }
            }

            Button(
                onClick = {
                    coroutineScope.launch {
                        runningPrediction = true
                        result = repository.predictDisease(selectedSymptoms.toList(), severity.toInt())
                        runningPrediction = false
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = selectedSymptoms.isNotEmpty() && !runningPrediction
            ) {
                if (runningPrediction) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    Text("Analyze Symptoms with AI Diagnostic", fontWeight = FontWeight.Bold)
                }
            }

            // Diagnostic Output Card
            if (result != null) {
                val res = result!!
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("AI Prediction Output", color = Color.Gray, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(res.diseaseName, fontWeight = FontWeight.Black, fontSize = 22.sp, color = Color(0xFF0F172A))
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Column {
                                Text("Confidence Match", fontSize = 11.sp, color = Color.Gray)
                                Text("${res.confidence}%", fontWeight = FontWeight.Bold, color = Color(0xFF0D9488), fontSize = 16.sp)
                            }
                            Column {
                                Text("Risk Tier", fontSize = 11.sp, color = Color.Gray)
                                val riskColor = if (res.riskLevel == "High") Color.Red else if (res.riskLevel == "Medium") Color(0xFFD97706) else Color(0xFF057857)
                                Text(res.riskLevel, fontWeight = FontWeight.Bold, color = riskColor, fontSize = 16.sp)
                            }
                        }
                        
                        Divider(modifier = Modifier.padding(vertical = 12.dp), color = Color(0xFFF1F5F9))
                        
                        Text("Immediate Precautions:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text(res.precautions, fontSize = 12.sp, color = Color(0xFF475569))
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Recommended Action:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text(res.recommendedAction, fontSize = 12.sp, color = Color(0xFF475569))

                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Suggested Specialist:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text(res.specialist, fontSize = 12.sp, color = Color(0xFF0D9488), fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// Simple FlowRow helper composable for chips
@Composable
fun FlowRow(
    modifier: Modifier = Modifier,
    mainAxisSpacing: androidx.compose.ui.unit.Dp = 0.dp,
    crossAxisSpacing: androidx.compose.ui.unit.Dp = 0.dp,
    content: @Composable () -> Unit
) {
    androidx.compose.ui.layout.Layout(
        modifier = modifier,
        content = content
    ) { measurables, constraints ->
        val placeables = measurables.map { it.measure(constraints) }
        layout(constraints.maxWidth, constraints.maxHeight) {
            var y = 0
            var x = 0
            var maxRowHeight = 0
            placeables.forEach { placeable ->
                if (x + placeable.width > constraints.maxWidth) {
                    x = 0
                    y += maxRowHeight + crossAxisSpacing.roundToPx()
                    maxRowHeight = 0
                }
                placeable.placeRelative(x, y)
                x += placeable.width + mainAxisSpacing.roundToPx()
                maxRowHeight = maxOf(maxRowHeight, placeable.height)
            }
        }
    }
}

// ==========================================
// --- Tab 3: Beds board (SSE Simulation) ---
// ==========================================
@Composable
fun TabBeds(repository: DataRepository) {
    val hospitalsState = remember { mutableStateOf(repository.getHospitals()) }

    LaunchedEffect(Unit) {
        repository.getRealTimeBeds().collect { updated ->
            hospitalsState.value = updated
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Real-Time Capacity Board", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF1E293B))
        Text("ICU and Ventilator capacities update live via server events.", fontSize = 12.sp, color = Color.Gray)

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(hospitalsState.value) { hospital ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(hospital.name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            
                            // Color code indicator
                            val ratio = if (hospital.totalBeds > 0) hospital.availableBeds.toFloat() / hospital.totalBeds else 0f
                            val (badgeColor, badgeBg, badgeLabel) = if (ratio > 0.20f) {
                                Triple(Color(0xFF047857), Color(0xFFECFDF5), "AVAILABLE")
                            } else if (ratio > 0.05f) {
                                Triple(Color(0xFFB45309), Color(0xFFFFFBEB), "LIMITED")
                            } else {
                                Triple(Color(0xFFB91C1C), Color(0xFFFEF2F2), "FULL")
                            }
                            
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(badgeBg)
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(badgeLabel, color = badgeColor, fontWeight = FontWeight.Bold, fontSize = 9.sp)
                            }
                        }
                        Spacer(modifier = Modifier.height(12.dp))

                        // Ward Metrics Grid
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                                Text("WARD BEDS", fontSize = 10.sp, color = Color.Gray)
                                Text("${hospital.availableBeds}/${hospital.totalBeds}", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                                Text("ICU BEDS", fontSize = 10.sp, color = Color.Gray)
                                Text("${hospital.availableIcu}/${hospital.icuBeds}", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = if (hospital.availableIcu == 0) Color.Red else Color.Unspecified)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                                Text("VENTILATORS", fontSize = 10.sp, color = Color.Gray)
                                Text("${hospital.availableVentilators}/${hospital.ventilators}", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = if (hospital.availableVentilators == 0) Color.Red else Color.Unspecified)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// --- Tab 4: Appointment Booking ---
// ==========================================
@Composable
fun TabAppointments(repository: DataRepository, onSignInClick: () -> Unit) {
    val hospitals = repository.getHospitals()
    var selectedHosp by remember { mutableStateOf(hospitals.firstOrNull()) }
    var doctors by remember { mutableStateOf(selectedHosp?.let { repository.getDoctors(it.id) } ?: emptyList()) }
    var selectedDoc by remember { mutableStateOf(doctors.firstOrNull()) }

    var appointmentDate by remember { mutableStateOf("2026-06-25") }
    var appointmentTime by remember { mutableStateOf("10:00 AM") }
    var notes by remember { mutableStateOf("") }
    
    var bookingInProgress by remember { mutableStateOf(false) }
    var bookingMessage by remember { mutableStateOf("") }

    val coroutineScope = rememberCoroutineScope()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Clinical Consultations Scheduling", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF1E293B))
        }

        if (repository.currentUser == null) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB)),
                    border = BorderStroke(1.dp, Color(0xFFFDE68A))
                ) {
                    Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Sign In Required", fontWeight = FontWeight.Bold, color = Color(0xFF92400E), fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Sign in to book doctor appointments and view histories.", fontSize = 12.sp, color = Color(0xFFB45309))
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(onClick = onSignInClick) {
                            Text("Sign In")
                        }
                    }
                }
            }
        } else {
            // Book Form
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Book Consult Slot", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(12.dp))

                        // Select Hospital (Simulated Dropdown/List)
                        Text("Select Hospital", fontSize = 11.sp, color = Color.Gray)
                        Row(modifier = Modifier.horizontalScroll(rememberScrollState())) {
                            hospitals.forEach { h ->
                                val isSelected = selectedHosp?.id == h.id
                                FilterChip(
                                    selected = isSelected,
                                    onClick = {
                                        selectedHosp = h
                                        doctors = repository.getDoctors(h.id)
                                        selectedDoc = doctors.firstOrNull()
                                    },
                                    label = { Text(h.name, fontSize = 11.sp) },
                                    modifier = Modifier.padding(end = 6.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Select Doctor
                        if (doctors.isNotEmpty()) {
                            Text("Select Doctor Specialist", fontSize = 11.sp, color = Color.Gray)
                            Row(modifier = Modifier.horizontalScroll(rememberScrollState())) {
                                doctors.forEach { d ->
                                    val isSelected = selectedDoc?.id == d.id
                                    FilterChip(
                                        selected = isSelected,
                                        onClick = { selectedDoc = d },
                                        label = { Text("${d.name} (${d.specialization})", fontSize = 11.sp) },
                                        modifier = Modifier.padding(end = 6.dp)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Date & Time Fields
                        Row(modifier = Modifier.fillMaxWidth()) {
                            OutlinedTextField(
                                value = appointmentDate,
                                onValueChange = { appointmentDate = it },
                                label = { Text("Date (YYYY-MM-DD)", fontSize = 12.sp) },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            OutlinedTextField(
                                value = appointmentTime,
                                onValueChange = { appointmentTime = it },
                                label = { Text("Time Slot", fontSize = 12.sp) },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = notes,
                            onValueChange = { notes = it },
                            label = { Text("Consult Notes / Symptoms") },
                            modifier = Modifier.fillMaxWidth(),
                            maxLines = 2
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        if (bookingMessage.isNotEmpty()) {
                            Text(bookingMessage, color = Color(0xFF047857), fontWeight = FontWeight.Bold, fontSize = 12.sp, modifier = Modifier.padding(bottom = 8.dp))
                        }

                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    bookingInProgress = true
                                    bookingMessage = ""
                                    val success = repository.bookAppointment(
                                        selectedHosp?.id ?: 1,
                                        selectedDoc?.id ?: 1,
                                        "${appointmentDate}T10:00:00.000Z",
                                        notes
                                    )
                                    bookingInProgress = false
                                    if (success) {
                                        bookingMessage = "Appointment Booked Successfully!"
                                        notes = ""
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !bookingInProgress && selectedDoc != null
                        ) {
                            if (bookingInProgress) {
                                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                            } else {
                                Text("Book Slot", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            // Booking History
            if (repository.appointments.isNotEmpty()) {
                item {
                    Text("Appointment Schedule Logs", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
                items(repository.appointments) { appt ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                    ) {
                        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Check, contentDescription = "Confirmed", tint = Color(0xFF057857))
                            Spacer(modifier = Modifier.width(16.dp))
                            Column {
                                Text(appt.doctorName, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text("${appt.hospitalName} | ${appt.dateTime}", fontSize = 12.sp, color = Color.Gray)
                                if (appt.notes.isNotEmpty()) {
                                    Text("Notes: ${appt.notes}", fontSize = 11.sp, color = Color.Gray)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// --- Tab 5: Medical Reports ---
// ==========================================
@Composable
fun TabReports(repository: DataRepository, onSignInClick: () -> Unit) {
    var reportsList by remember { mutableStateOf(repository.reports) }
    var uploadingReport by remember { mutableStateOf(false) }
    var uploadStatus by remember { mutableStateOf("") }
    
    val coroutineScope = rememberCoroutineScope()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Clinical Medical Reports Portal", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF1E293B))
        }

        if (repository.currentUser == null) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB)),
                    border = BorderStroke(1.dp, Color(0xFFFDE68A))
                ) {
                    Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Sign In Required", fontWeight = FontWeight.Bold, color = Color(0xFF92400E), fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Sign in to upload labs, imaging, and generate health report logs.", fontSize = 12.sp, color = Color(0xFFB45309))
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(onClick = onSignInClick) {
                            Text("Sign In")
                        }
                    }
                }
            }
        } else {
            // Upload report simulator
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Lab & Report Uploader", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color(0xFF0F172A))
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Simulate uploading medical documents (PDF / PNG) to retrieve summary cards.", color = Color.Gray, fontSize = 11.sp)
                        
                        Spacer(modifier = Modifier.height(16.dp))

                        if (uploadStatus.isNotEmpty()) {
                            Text(uploadStatus, color = Color(0xFF047857), fontWeight = FontWeight.Bold, fontSize = 12.sp, modifier = Modifier.padding(bottom = 12.dp))
                        }

                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    uploadingReport = true
                                    uploadStatus = "Uploading blood_report_june2026.pdf..."
                                    repository.uploadReport("blood_report_june2026.pdf", 143212)
                                    uploadingReport = false
                                    uploadStatus = "Successfully uploaded and summarized!"
                                    reportsList = repository.reports.toList() // Force UI update
                                }
                            },
                            enabled = !uploadingReport
                        ) {
                            if (uploadingReport) {
                                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                            } else {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Add, contentDescription = "Upload")
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Simulate Report Upload")
                                }
                            }
                        }
                    }
                }
            }

            // Reports log
            item {
                Text("Clinical Summaries & History", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }

            items(reportsList) { report ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Info, contentDescription = "PDF", tint = Color(0xFFEF4444), modifier = Modifier.size(20.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(report.filename, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color(0xFF0F172A))
                            }
                            Text(report.uploadedAt, fontSize = 11.sp, color = Color.Gray)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(report.summary, fontSize = 12.sp, color = Color(0xFF475569), lineHeight = 16.sp)
                    }
                }
            }
        }
    }
}
