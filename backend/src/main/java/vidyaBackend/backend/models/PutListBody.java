package vidyaBackend.backend.models;

public class PutListBody
{
    public String list;
    public String action;

    public  PutListBody(String list, String action)
    {
        this.list = list;
        this.action = action;
    }
}
