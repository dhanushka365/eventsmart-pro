using System.Text;
using System.Text.Json;

namespace backend.Services
{
    public interface IAIService
    {
        Task<string> GenerateEventDescriptionAsync(string title, string category, string? basicDescription = null);
        Task<string> GenerateEventSummaryAsync(int eventId);
        Task<List<string>> GetEventPlanningTipsAsync(string category, DateTime startDate, int expectedAttendees);
    }

    public class AIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _openAiApiKey;

        public AIService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _openAiApiKey = _configuration["OpenAI:ApiKey"] ?? throw new InvalidOperationException("OpenAI API key not found");
            
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_openAiApiKey}");
        }

        public async Task<string> GenerateEventDescriptionAsync(string title, string category, string? basicDescription = null)
        {
            try
            {
                var prompt = $@"Create an engaging and compelling event description for the following event:
                
                                Title: {title}
                                Category: {category}
                                {(string.IsNullOrEmpty(basicDescription) ? "" : $"Basic Description: {basicDescription}")}

                                Please write a professional, exciting description that would attract attendees. Include:
                                - What attendees can expect
                                - Key benefits of attending
                                - A call to action
                                - Keep it under 300 words
                                - Make it engaging and professional

                                Description:";

                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                        new { role = "system", content = "You are a professional event marketing copywriter." },
                        new { role = "user", content = prompt }
                    },
                    max_tokens = 400,
                    temperature = 0.7
                };

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<dynamic>(responseContent);
                    
                    // Extract the generated text (this is a simplified approach)
                    return result?.choices?[0]?.message?.content?.ToString() ?? basicDescription ?? title;
                }
                else
                {
                    // Fallback to basic description or a default message
                    return basicDescription ?? $"Join us for {title} - an exciting {category.ToLower()} event!";
                }
            }
            catch (Exception)
            {
                // Fallback in case of any errors
                return basicDescription ?? $"Join us for {title} - an exciting {category.ToLower()} event!";
            }
        }

        public async Task<string> GenerateEventSummaryAsync(int eventId)
        {
            try
            {
                var prompt = $@"Generate a brief post-event summary for event ID {eventId}. 
                Create a professional summary that could be used for:
                - Thank you messages to attendees
                - Social media posts
                - Newsletter content
                
                Include placeholders for:
                - Number of attendees
                - Key highlights
                - Thank you message
                
                Keep it under 200 words and make it engaging.";

                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                        new { role = "system", content = "You are a professional event coordinator writing post-event summaries." },
                        new { role = "user", content = prompt }
                    },
                    max_tokens = 300,
                    temperature = 0.6
                };

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<dynamic>(responseContent);
                    return result?.choices?[0]?.message?.content?.ToString() ?? "Thank you for attending our event!";
                }
                else
                {
                    return "Thank you for attending our event! We hope you had a great experience.";
                }
            }
            catch (Exception)
            {
                return "Thank you for attending our event! We hope you had a great experience.";
            }
        }

        public async Task<List<string>> GetEventPlanningTipsAsync(string category, DateTime startDate, int expectedAttendees)
        {
            try
            {
                var daysUntilEvent = (startDate - DateTime.UtcNow).Days;
                
                var prompt = $@"Provide 5-7 practical event planning tips for:
                
                            Event Category: {category}
                            Expected Attendees: {expectedAttendees}
                            Days Until Event: {daysUntilEvent}

                            Focus on actionable advice that event organizers can implement. Include tips about:
                            - Venue considerations
                            - Marketing strategies
                            - Logistics
                            - Attendee engagement
                            - Timeline recommendations

                            Format as a simple list.";

                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                        new { role = "system", content = "You are an experienced event planning consultant." },
                        new { role = "user", content = prompt }
                    },
                    max_tokens = 400,
                    temperature = 0.7
                };

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<dynamic>(responseContent);
                    var tipsText = result?.choices?[0]?.message?.content?.ToString() ?? "";
                    
                    // Parse the tips from the response (simplified)
                    var lines = tipsText.Split('\n');
                    var tips = new List<string>();
                    
                    foreach (var line in lines)
                    {
                        if (!string.IsNullOrWhiteSpace(line))
                        {
                            var trimmedLine = line.Trim();
                            if (trimmedLine.Contains("-") || trimmedLine.Contains("•") || 
                                (trimmedLine.Length > 0 && char.IsDigit(trimmedLine[0])))
                            {
                                var cleanTip = trimmedLine.TrimStart('-', '•', ' ').Trim();
                                if (!string.IsNullOrWhiteSpace(cleanTip))
                                {
                                    tips.Add(cleanTip);
                                }
                            }
                        }
                    }

                    return tips.Count > 0 ? tips : GetDefaultTips(category);
                }
                else
                {
                    return GetDefaultTips(category);
                }
            }
            catch (Exception)
            {
                return GetDefaultTips(category);
            }
        }

        private List<string> GetDefaultTips(string category)
        {
            return new List<string>
            {
                "Start planning at least 6-8 weeks in advance",
                "Create a detailed timeline and checklist",
                "Confirm venue capacity matches expected attendance",
                "Set up registration early to gauge interest",
                "Plan for 10-15% more attendees than registered",
                "Have a backup plan for technical issues",
                "Follow up with attendees before and after the event"
            };
        }
    }
}
