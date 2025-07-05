using Google.Apis.Auth;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public interface IGoogleAuthService
    {
        Task<GoogleJsonWebSignature.Payload> ValidateGoogleTokenAsync(string googleToken);
    }

    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly GoogleAuthSettings _googleSettings;

        public GoogleAuthService(IOptions<GoogleAuthSettings> googleSettings)
        {
            _googleSettings = googleSettings.Value;
        }

        public async Task<GoogleJsonWebSignature.Payload> ValidateGoogleTokenAsync(string googleToken)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new List<string> { _googleSettings.ClientId }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(googleToken, settings);
                return payload;
            }
            catch (Exception ex)
            {
                throw new UnauthorizedAccessException($"Invalid Google token: {ex.Message}");
            }
        }
    }

    public class GoogleAuthSettings
    {
        public string ClientId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
    }
}
